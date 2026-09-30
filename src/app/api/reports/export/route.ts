import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/utils";

const allowed = ["attendance", "leave", "employees", "payroll", "departments", "branches"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as (typeof allowed)[number] | null;
  if (!type || !allowed.includes(type)) {
    return NextResponse.json({ error: "Choose a valid report type." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let rows: Record<string, unknown>[] = [];
  if (type === "employees") {
    const { data } = await supabase
      .from("employees")
      .select("employee_code, full_name, email, employment_status")
      .is("deleted_at", null)
      .limit(500);
    rows = data ?? [];
  }
  if (type === "attendance") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    let query = supabase.from("attendance").select("work_date, status, is_late, employees(full_name, employee_code)").limit(500);
    if (from) query = query.gte("work_date", from);
    if (to) query = query.lte("work_date", to);
    const { data } = await query;
    rows = (data ?? []).map((row) => ({
      work_date: row.work_date,
      status: row.status,
      is_late: row.is_late,
      employee: (row.employees as { full_name?: string } | null)?.full_name,
    }));
  }
  if (type === "leave") {
    const { data } = await supabase
      .from("leave_requests")
      .select("start_date, end_date, days, status, employees(full_name)")
      .limit(500);
    rows = data ?? [];
  }
  if (type === "payroll") {
    const { data } = await supabase
      .from("payroll_items")
      .select("basic_salary, allowances, deductions, net_salary, employees(full_name)")
      .limit(500);
    rows = data ?? [];
  }
  if (type === "departments") {
    const { data } = await supabase.from("departments").select("name, is_active").limit(500);
    rows = data ?? [];
  }
  if (type === "branches") {
    const { data } = await supabase.from("branches").select("name, city, geofence_radius_m, is_active").limit(500);
    rows = data ?? [];
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${type}-report.csv`,
    },
  });
}
