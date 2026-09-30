import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/services/audit";
import { notifyPermissionHolders, requireCompanyContext } from "@/lib/services/require-company";
import { correctionSchema } from "@/lib/validations/hr";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit("attendance-correct", 30, 60 * 1000);
  if (!limited.success) return NextResponse.json({ error: "Too many correction requests." }, { status: 429 });

  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.ctx.employeeId) {
    return NextResponse.json({ error: "No employee profile is linked to this account." }, { status: 403 });
  }

  const parsed = correctionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check correction details." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: attendance } = await admin
    .from("attendance")
    .select("id, status")
    .eq("employee_id", auth.ctx.employeeId)
    .eq("work_date", parsed.data.workDate)
    .maybeSingle();

  const { data: row, error } = await admin
    .from("attendance_corrections")
    .insert({
      company_id: auth.ctx.companyId,
      employee_id: auth.ctx.employeeId,
      attendance_id: attendance?.id ?? null,
      work_date: parsed.data.workDate,
      current_status: attendance?.status ?? null,
      requested_status: parsed.data.requestedStatus,
      reason: parsed.data.reason,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !row) return NextResponse.json({ error: "Unable to submit the correction." }, { status: 400 });

  await admin.from("attendance_correction_audit").insert({
    company_id: auth.ctx.companyId,
    correction_id: row.id,
    actor_id: auth.ctx.userId,
    action: "requested",
    old_value: { status: attendance?.status ?? null },
    new_value: { status: parsed.data.requestedStatus, reason: parsed.data.reason },
  });

  await notifyPermissionHolders({
    companyId: auth.ctx.companyId,
    permission: "attendance.correct",
    title: "Attendance correction request",
    body: `A correction was requested for ${parsed.data.workDate}.`,
    type: "attendance.correction",
    data: { correctionId: row.id },
  });
  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: "attendance.correction.requested",
    entity: "attendance_corrections",
    entityId: row.id,
  });

  return NextResponse.json({ id: row.id });
}
