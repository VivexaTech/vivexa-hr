import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/services/notifications";
import { writeAudit } from "@/lib/services/audit";
import { hasPerm, requireCompanyContext } from "@/lib/services/require-company";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit("leave-review", 60, 60 * 1000);
  if (!limited.success) return NextResponse.json({ error: "Too many reviews." }, { status: 429 });

  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPerm(auth.ctx, "leave.approve")) {
    return NextResponse.json({ error: "You do not have permission to review leave." }, { status: 403 });
  }

  const body = (await request.json()) as { id?: string; status?: "approved" | "rejected"; note?: string };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ error: "A leave request and decision are required." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: existing } = await admin
    .from("leave_requests")
    .select("id, status, employee_id, company_id")
    .eq("id", body.id)
    .eq("company_id", auth.ctx.companyId)
    .maybeSingle();
  if (!existing || existing.status !== "pending") {
    return NextResponse.json({ error: "This request is no longer pending." }, { status: 409 });
  }

  const { error } = await admin
    .from("leave_requests")
    .update({
      status: body.status,
      reviewed_by: auth.ctx.userId,
      reviewed_at: new Date().toISOString(),
      review_note: body.note || null,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json(
      { error: error.message.includes("Insufficient leave") ? "Insufficient leave balance." : "Unable to update the request." },
      { status: 400 },
    );
  }

  const { data: employee } = await admin.from("employees").select("user_id, full_name").eq("id", existing.employee_id).maybeSingle();
  if (employee?.user_id) {
    await createNotification({
      companyId: auth.ctx.companyId,
      userId: employee.user_id,
      employeeId: existing.employee_id,
      title: body.status === "approved" ? "Leave approved" : "Leave rejected",
      body: body.status === "approved" ? "Your leave request was approved." : "Your leave request was not approved.",
      type: body.status === "approved" ? "leave.approved" : "leave.rejected",
    });
  }

  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: `leave.${body.status}`,
    entity: "leave_requests",
    entityId: body.id,
    oldValue: { status: existing.status },
    newValue: { status: body.status },
  });

  return NextResponse.json({ ok: true });
}
