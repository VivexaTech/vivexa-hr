import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/utils";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data, error } = await supabase
    .from("employees")
    .select("employee_code, full_name, email, phone, employment_status, joining_date")
    .is("deleted_at", null)
    .order("full_name")
    .limit(500);

  if (error) return NextResponse.json({ error: "Unable to export employees." }, { status: 400 });

  const csv = toCsv(data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=employees.csv",
    },
  });
}
