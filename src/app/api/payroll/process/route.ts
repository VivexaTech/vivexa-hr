import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/services/audit";
import { rateLimit } from "@/lib/rate-limit";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export async function POST(request: Request) {
  const limited = rateLimit("payroll", 20, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Payroll is busy. Try again shortly." }, { status: 429 });
  }

  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { month, year } = (await request.json()) as { month: number; year: number };
  if (!month || !year) return NextResponse.json({ error: "Month and year are required." }, { status: 400 });

  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company is linked to this account." }, { status: 403 });

  const { data: permissionRows } = await admin
    .from("user_roles")
    .select("roles(role_permissions(permissions(key)))")
    .eq("user_id", user.id)
    .eq("company_id", profile.company_id);

  const keys = new Set<string>();
  for (const row of permissionRows ?? []) {
    const role = row.roles as { role_permissions?: { permissions?: { key?: string } }[] } | null;
    for (const rp of role?.role_permissions ?? []) {
      if (rp.permissions?.key) keys.add(rp.permissions.key);
    }
  }
  if (!keys.has("payroll.manage")) {
    const { data: profileFlags } = await admin.from("users").select("is_super_admin").eq("id", user.id).maybeSingle();
    if (!profileFlags?.is_super_admin) {
      return NextResponse.json({ error: "You do not have permission to run payroll." }, { status: 403 });
    }
  }

  await admin.rpc("generate_attendance_summary", {
    p_company_id: profile.company_id,
    p_month: month,
    p_year: year,
  });

  const { data: employees } = await admin
    .from("employees")
    .select("id, user_id, full_name")
    .eq("company_id", profile.company_id)
    .eq("employment_status", "active")
    .is("deleted_at", null);

  const { data: payroll, error: payrollError } = await admin
    .from("payroll")
    .upsert(
      {
        company_id: profile.company_id,
        month,
        year,
        status: "processing",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "company_id,month,year" },
    )
    .select("id")
    .single();

  if (payrollError || !payroll) {
    return NextResponse.json({ error: "Unable to create payroll run." }, { status: 400 });
  }

  for (const employee of employees ?? []) {
    const { data: structure } = await admin
      .from("salary_structures")
      .select("id, basic_salary")
      .eq("employee_id", employee.id)
      .maybeSingle();
    const { data: components } = structure
      ? await admin.from("salary_components").select("component_type, amount, is_percentage").eq("salary_structure_id", structure.id)
      : { data: [] };

    const basic = Number(structure?.basic_salary ?? 0);
    let allowances = 0;
    let deductions = 0;
    for (const component of components ?? []) {
      const amount = component.is_percentage ? (basic * Number(component.amount)) / 100 : Number(component.amount);
      if (component.component_type === "allowance") allowances += amount;
      if (component.component_type === "deduction") deductions += amount;
    }

    const { data: summary } = await admin
      .from("attendance_summary")
      .select("absent_days, working_days")
      .eq("employee_id", employee.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    const workingDays = summary?.working_days || 26;
    const unpaid = workingDays > 0 ? (basic / workingDays) * Number(summary?.absent_days ?? 0) : 0;
    const net = roundMoney(basic + allowances - deductions - unpaid);

    const { data: item } = await admin
      .from("payroll_items")
      .upsert(
        {
          company_id: profile.company_id,
          payroll_id: payroll.id,
          employee_id: employee.id,
          basic_salary: roundMoney(basic),
          allowances: roundMoney(allowances),
          deductions: roundMoney(deductions),
          unpaid_leave_deduction: roundMoney(unpaid),
          overtime_amount: 0,
          bonus: 0,
          net_salary: net,
        },
        { onConflict: "payroll_id,employee_id" },
      )
      .select("id")
      .single();

    if (item?.id) {
      await admin.from("payslips").upsert(
        {
          company_id: profile.company_id,
          payroll_item_id: item.id,
          employee_id: employee.id,
        },
        { onConflict: "payroll_item_id" },
      );
    }

    if (employee.user_id) {
      await admin.from("notifications").insert({
        company_id: profile.company_id,
        user_id: employee.user_id,
        employee_id: employee.id,
        title: "Payslip generated",
        body: `Your payslip for ${month}/${year} is ready.`,
        type: "payslip.generated",
        data: { month, year, net },
      });
    }
  }

  await admin.from("payroll").update({ status: "completed" }).eq("id", payroll.id);
  await writeAudit({
    companyId: profile.company_id,
    actorId: user.id,
    action: "payroll.processed",
    entity: "payroll",
    entityId: payroll.id,
    newValue: { month, year },
  });

  return NextResponse.json({ payrollId: payroll.id, employeeCount: employees?.length ?? 0 });
}
