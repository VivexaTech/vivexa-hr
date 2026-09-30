import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/services/notifications";
import { writeAudit } from "@/lib/services/audit";
import { inclusiveDays, notifyPermissionHolders, requireCompanyContext } from "@/lib/services/require-company";
import { leaveRequestSchema } from "@/lib/validations/hr";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit("leave-apply", 30, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many leave requests. Try again shortly." }, { status: 429 });
  }

  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.ctx.employeeId) {
    return NextResponse.json({ error: "No employee profile is linked to this account." }, { status: 403 });
  }

  const parsed = leaveRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check leave details." }, { status: 400 });
  }

  const days = inclusiveDays(parsed.data.startDate, parsed.data.endDate);
  if (!days) return NextResponse.json({ error: "The end date must be on or after the start date." }, { status: 400 });

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: overlap } = await admin
    .from("leave_requests")
    .select("id")
    .eq("employee_id", auth.ctx.employeeId)
    .in("status", ["pending", "approved"])
    .lte("start_date", parsed.data.endDate)
    .gte("end_date", parsed.data.startDate)
    .maybeSingle();
  if (overlap) {
    return NextResponse.json({ error: "Those dates overlap an existing leave request." }, { status: 409 });
  }

  const year = Number(parsed.data.startDate.slice(0, 4));
  const { data: leaveType } = await admin
    .from("leave_types")
    .select("id, name, is_paid, company_id")
    .eq("id", parsed.data.leaveTypeId)
    .eq("company_id", auth.ctx.companyId)
    .maybeSingle();
  if (!leaveType) return NextResponse.json({ error: "That leave type is not available." }, { status: 400 });

  if (leaveType.is_paid) {
    const { data: balance } = await admin
      .from("leave_balances")
      .select("remaining")
      .eq("employee_id", auth.ctx.employeeId)
      .eq("leave_type_id", parsed.data.leaveTypeId)
      .eq("year", year)
      .maybeSingle();
    if (Number(balance?.remaining ?? 0) < days) {
      return NextResponse.json({ error: "There is not enough leave remaining for this type." }, { status: 422 });
    }
  }

  const { data: requestRow, error } = await admin
    .from("leave_requests")
    .insert({
      company_id: auth.ctx.companyId,
      employee_id: auth.ctx.employeeId,
      leave_type_id: parsed.data.leaveTypeId,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      days,
      reason: parsed.data.reason,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !requestRow) {
    return NextResponse.json({ error: "Unable to submit the leave request." }, { status: 400 });
  }

  await notifyPermissionHolders({
    companyId: auth.ctx.companyId,
    permission: "leave.approve",
    title: "New leave request",
    body: `${leaveType.name} from ${parsed.data.startDate} to ${parsed.data.endDate} needs a review.`,
    type: "leave.request",
    data: { leaveRequestId: requestRow.id },
  });
  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: "leave.applied",
    entity: "leave_requests",
    entityId: requestRow.id,
    newValue: parsed.data,
  });
  await createNotification({
    companyId: auth.ctx.companyId,
    userId: auth.ctx.userId,
    employeeId: auth.ctx.employeeId,
    title: "Leave submitted",
    body: "HR will review your request.",
    type: "leave.submitted",
  });

  return NextResponse.json({ id: requestRow.id, days });
}
