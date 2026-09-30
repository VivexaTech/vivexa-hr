import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/services/notifications";
import { writeAudit } from "@/lib/services/audit";
import { eachDate, hasPerm, requireCompanyContext } from "@/lib/services/require-company";

export async function POST(request: Request) {
  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPerm(auth.ctx, "leave.approve") && !hasPerm(auth.ctx, "attendance.manage")) {
    return NextResponse.json({ error: "You do not have permission to review WFH requests." }, { status: 403 });
  }

  const body = (await request.json()) as { id?: string; status?: "approved" | "rejected" };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ error: "A WFH request and decision are required." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: existing } = await admin
    .from("wfh_requests")
    .select("id, status, employee_id, start_date, end_date")
    .eq("id", body.id)
    .eq("company_id", auth.ctx.companyId)
    .maybeSingle();
  if (!existing || existing.status !== "pending") {
    return NextResponse.json({ error: "This request is no longer pending." }, { status: 409 });
  }

  const { error } = await admin
    .from("wfh_requests")
    .update({
      status: body.status,
      reviewed_by: auth.ctx.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: "Unable to update the request." }, { status: 400 });

  if (body.status === "approved") {
    for (const workDate of eachDate(existing.start_date, existing.end_date)) {
      const { data: current } = await admin
        .from("attendance")
        .select("id, status")
        .eq("employee_id", existing.employee_id)
        .eq("work_date", workDate)
        .maybeSingle();
      if (current?.status === "leave" || current?.status === "holiday") continue;
      await admin.from("attendance").upsert(
        {
          company_id: auth.ctx.companyId,
          employee_id: existing.employee_id,
          work_date: workDate,
          status: "wfh",
        },
        { onConflict: "company_id,employee_id,work_date" },
      );
    }
  }

  const { data: employee } = await admin.from("employees").select("user_id").eq("id", existing.employee_id).maybeSingle();
  if (employee?.user_id) {
    await createNotification({
      companyId: auth.ctx.companyId,
      userId: employee.user_id,
      employeeId: existing.employee_id,
      title: body.status === "approved" ? "WFH approved" : "WFH rejected",
      body: body.status === "approved" ? "Your work-from-home request was approved." : "Your work-from-home request was not approved.",
      type: body.status === "approved" ? "wfh.approved" : "wfh.rejected",
    });
  }

  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: `wfh.${body.status}`,
    entity: "wfh_requests",
    entityId: body.id,
  });

  return NextResponse.json({ ok: true });
}
