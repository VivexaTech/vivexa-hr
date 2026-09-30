import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/services/audit";
import { rateLimit } from "@/lib/rate-limit";

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = (headerLine ?? "").split(",").map((value) => value.trim().toLowerCase());
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export async function POST(request: Request) {
  const limited = rateLimit("import", 10, 10 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Import is limited. Try again later." }, { status: 429 });
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

  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company is linked to this account." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a CSV file." }, { status: 400 });
  }

  const rows = parseCsv(await file.text());
  let created = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const fullName = row.full_name || row.name;
    const employeeCode = row.employee_code || row.employee_id;
    if (!fullName || !employeeCode) {
      errors.push("A row is missing name or employee ID.");
      continue;
    }
    const { error } = await admin.from("employees").insert({
      company_id: profile.company_id,
      full_name: fullName,
      employee_code: employeeCode,
      email: row.email || null,
      phone: row.phone || null,
      joining_date: row.joining_date || null,
      employment_type: row.employment_type || "full_time",
      employment_status: "active",
    });
    if (error) {
      errors.push(error.message.includes("Employee limit") ? "Employee limit reached." : `Could not import ${employeeCode}.`);
      if (error.message.includes("Employee limit")) break;
    } else {
      created += 1;
    }
  }

  await writeAudit({
    companyId: profile.company_id,
    actorId: user.id,
    action: "employees.imported",
    entity: "employees",
    newValue: { created, errors: errors.length },
  });

  return NextResponse.json({ created, errors });
}
