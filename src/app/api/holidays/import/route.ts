import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasPerm, requireCompanyContext } from "@/lib/services/require-company";
import { writeAudit } from "@/lib/services/audit";

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = (headerLine ?? "").split(",").map((value) => value.trim().toLowerCase());
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export async function POST(request: Request) {
  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPerm(auth.ctx, "holidays.manage")) {
    return NextResponse.json({ error: "You do not have permission to import holidays." }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Upload a CSV file." }, { status: 400 });

  const rows = parseCsv(await file.text());
  let created = 0;
  const errors: string[] = [];
  for (const row of rows) {
    const name = row.name || row.title;
    const holidayDate = row.holiday_date || row.date;
    if (!name || !holidayDate) {
      errors.push("A row is missing name or date.");
      continue;
    }
    const type = ["public", "company", "optional"].includes(row.holiday_type) ? row.holiday_type : "company";
    const { error } = await admin.from("holidays").insert({
      company_id: auth.ctx.companyId,
      name,
      holiday_date: holidayDate,
      holiday_type: type,
    });
    if (error) errors.push(`Could not import ${name}.`);
    else created += 1;
  }

  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: "holidays.imported",
    entity: "holidays",
    newValue: { created, errors: errors.length },
  });

  return NextResponse.json({ created, errors });
}
