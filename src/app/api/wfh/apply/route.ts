import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/services/audit";
import { inclusiveDays, notifyPermissionHolders, requireCompanyContext } from "@/lib/services/require-company";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  reason: z.string().min(3, "Enter a reason."),
});

export async function POST(request: Request) {
  const limited = rateLimit("wfh-apply", 30, 60 * 1000);
  if (!limited.success) return NextResponse.json({ error: "Too many WFH requests." }, { status: 429 });

  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.ctx.employeeId) {
    return NextResponse.json({ error: "No employee profile is linked to this account." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check WFH details." }, { status: 400 });
  }
  if (!inclusiveDays(parsed.data.startDate, parsed.data.endDate)) {
    return NextResponse.json({ error: "The end date must be on or after the start date." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const { data: row, error } = await admin
    .from("wfh_requests")
    .insert({
      company_id: auth.ctx.companyId,
      employee_id: auth.ctx.employeeId,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      reason: parsed.data.reason,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !row) return NextResponse.json({ error: "Unable to submit the WFH request." }, { status: 400 });

  await notifyPermissionHolders({
    companyId: auth.ctx.companyId,
    permission: "leave.approve",
    title: "New work-from-home request",
    body: `WFH from ${parsed.data.startDate} to ${parsed.data.endDate} needs a review.`,
    type: "wfh.request",
    data: { wfhRequestId: row.id },
  });
  await writeAudit({
    companyId: auth.ctx.companyId,
    actorId: auth.ctx.userId,
    action: "wfh.applied",
    entity: "wfh_requests",
    entityId: row.id,
  });

  return NextResponse.json({ id: row.id });
}
