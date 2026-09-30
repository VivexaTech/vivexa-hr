import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/services/notifications";
import { writeAudit } from "@/lib/services/audit";
import { hasPerm, requireCompanyContext } from "@/lib/services/require-company";

export async function POST(request: Request) {
  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPerm(auth.ctx, "attendance.correct")) {
    return NextResponse.json({ error: "You do not have permission to review corrections." }, { status: 403 });
  }

  const body = (await request.json()) as { id?: string; status?: "approved" | "rejected"; note?: string };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ error: "A correction and decision are required." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: existing } = await admin
    .from("attendance_corrections")
    .select("id, status, employee_id, attendance_id, work_date, current_status, requested_status")
    .eq("id", body.id)
    .eq("company_id", auth.ctx.companyId)
    .maybeSingle();
  if (!existing || existing.status !== "pending") {
    return NextResponse.json({ error: "This correction is no longer pending." }, { status: 409 });
  }

  const { error } = await admin
    .from("attendance_corrections")
    .update({
      status: body.status,
      reviewed_by: auth.ctx.userId,
      reviewed_at: new Date().toISOString(),
      review_note: body.note || null,
    })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: "Unable to update the correction." }, { status: 400 });

  if (body.status === "approved") {
    await admin.from("attendance").upsert(
      {
        company_id: auth.ctx.companyId,
        employee_id: existing.employee_id,
        work_date: existing.work_date,
        status: existing.requested_status,
        notes: "Corrected after HR review",
      },
      { onConflict: "company_id,employee_id,work_date" },
    );
  }

  await admin.from("attendance_correction_audit").insert({
    company_id: auth.ctx.companyId,
    correction_id: existing.id,
    actor_id: auth.ctx.userId,
    action: body.status,
    old_value: { status: existing.current_status },
    new_value: { status: existing.requested_status, decision: body.status },
  });

  const { data: employee } = await admin.from("employees").select("user_id").eq("id", existing.employee_id).maybeSingle();
  if (employee?.user_id) {
    await createNotification({
      companyId: auth.ctx.companyId,
      userId: employee.user_id,
      employeeId: existing.employee_id,
      title: body.status === "approved" ? "Attendance correction approved" : "Attendance correction rejected",
      body:
        body.status === "approved"
          ? `Attendance for ${existing.work_date} was updated.`
          : `The correction for ${existing.work_date} was not approved.`,
      type: body.status === "approved" ? "attendance.corrected" : "attendance.correction.rejected",
    });
  }

  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: `attendance.correction.${body.status}`,
    entity: "attendance_corrections",
    entityId: existing.id,
    oldValue: { status: existing.current_status },
    newValue: { status: existing.requested_status },
  });

  return NextResponse.json({ ok: true });
}
