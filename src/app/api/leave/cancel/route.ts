import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireCompanyContext } from "@/lib/services/require-company";

export async function POST(request: Request) {
  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.ctx.employeeId) {
    return NextResponse.json({ error: "No employee profile is linked to this account." }, { status: 403 });
  }

  const { id } = (await request.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Leave request is required." }, { status: 400 });

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: existing } = await admin
    .from("leave_requests")
    .select("id, status, employee_id")
    .eq("id", id)
    .eq("employee_id", auth.ctx.employeeId)
    .maybeSingle();
  if (!existing || existing.status !== "pending") {
    return NextResponse.json({ error: "Only pending leave can be cancelled." }, { status: 409 });
  }

  const { error } = await admin.from("leave_requests").update({ status: "cancelled" }).eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to cancel the request." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
