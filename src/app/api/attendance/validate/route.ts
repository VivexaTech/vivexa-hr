import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/supabase/request-user";
import { rateLimit } from "@/lib/rate-limit";

type Payload = {
  clientEventId: string;
  eventType: "check_in" | "check_out";
  occurredAt: string;
  latitude?: number;
  longitude?: number;
  accuracyM?: number;
  deviceId?: string;
};

function minutesSince(start: string, occurred: Date) {
  const [hours, minutes] = start.split(":").map(Number);
  const startDate = new Date(occurred);
  startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return Math.floor((occurred.getTime() - startDate.getTime()) / 60000);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const limited = rateLimit(`attendance:${ip}`, 60, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attendance events." }, { status: 429 });
  }

  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const payload = (await request.json()) as Payload;
  if (!payload.clientEventId || !payload.eventType || !payload.occurredAt) {
    return NextResponse.json({ error: "Attendance event is incomplete." }, { status: 400 });
  }

  const { data: duplicate } = await admin
    .from("attendance_events")
    .select("id, attendance_id")
    .eq("client_event_id", payload.clientEventId)
    .maybeSingle();
  if (duplicate) {
    return NextResponse.json({ ok: true, duplicate: true, attendanceId: duplicate.attendance_id });
  }

  const { data: employee } = await admin
    .from("employees")
    .select("id, company_id, branch_id, employment_status, device_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!employee || employee.employment_status !== "active") {
    return NextResponse.json({ error: "No active employee profile is linked to this account." }, { status: 403 });
  }

  if (employee.device_id && payload.deviceId && employee.device_id !== payload.deviceId) {
    return NextResponse.json({ error: "This device is not registered for attendance." }, { status: 403 });
  }

  const occurred = new Date(payload.occurredAt);
  const workDate = occurred.toISOString().slice(0, 10);
  const { data: settings } = await admin.from("company_settings").select("*").eq("company_id", employee.company_id).single();
  const { data: branch } = employee.branch_id
    ? await admin.from("branches").select("*").eq("id", employee.branch_id).single()
    : { data: null };

  let withinGeofence: boolean | null = null;
  if (settings?.geofence_required && branch?.id && payload.latitude != null && payload.longitude != null) {
    const { data: geo } = await admin.rpc("is_within_geofence", {
      p_lat: payload.latitude,
      p_lng: payload.longitude,
      p_branch_id: branch.id,
    });
    withinGeofence = Boolean(geo);
    if (!withinGeofence) {
      await admin.from("attendance_events").insert({
        company_id: employee.company_id,
        employee_id: employee.id,
        event_type: payload.eventType,
        client_event_id: payload.clientEventId,
        occurred_at: occurred.toISOString(),
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy_m: payload.accuracyM,
        device_id: payload.deviceId,
        branch_id: branch.id,
        is_within_geofence: false,
        rejected_reason: "outside_geofence",
      });
      return NextResponse.json({ error: "You are outside the assigned office geofence." }, { status: 422 });
    }
  }

  const { data: holiday } = await admin
    .from("holidays")
    .select("id")
    .eq("company_id", employee.company_id)
    .eq("holiday_date", workDate)
    .maybeSingle();
  const { data: approvedLeave } = await admin
    .from("leave_requests")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("status", "approved")
    .lte("start_date", workDate)
    .gte("end_date", workDate)
    .maybeSingle();
  const { data: approvedWfh } = await admin
    .from("wfh_requests")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("status", "approved")
    .lte("start_date", workDate)
    .gte("end_date", workDate)
    .maybeSingle();

  const officeStart = String(branch?.office_start || settings?.office_start || "09:00").slice(0, 5);
  const lateAfter = settings?.late_mark_after_minutes ?? settings?.grace_period_minutes ?? 15;
  const isLate = payload.eventType === "check_in" && minutesSince(officeStart, occurred) > lateAfter;
  let status = isLate ? "late" : "present";
  if (holiday) status = "holiday";
  if (approvedLeave) status = "leave";
  if (approvedWfh) status = "wfh";

  const { data: attendance, error } = await admin
    .from("attendance")
    .upsert(
      {
        company_id: employee.company_id,
        employee_id: employee.id,
        work_date: workDate,
        status,
        branch_id: employee.branch_id,
        device_id: payload.deviceId,
        is_late: isLate,
        validated_at: new Date().toISOString(),
        ...(payload.eventType === "check_in"
          ? { check_in_at: occurred.toISOString(), check_in_lat: payload.latitude, check_in_lng: payload.longitude, client_event_id: payload.clientEventId }
          : { check_out_at: occurred.toISOString(), check_out_lat: payload.latitude, check_out_lng: payload.longitude }),
      },
      { onConflict: "company_id,employee_id,work_date" },
    )
    .select("id")
    .single();

  if (error || !attendance) {
    return NextResponse.json({ error: "Unable to save attendance." }, { status: 400 });
  }

  await admin.from("attendance_events").insert({
    company_id: employee.company_id,
    employee_id: employee.id,
    attendance_id: attendance.id,
    event_type: payload.eventType,
    client_event_id: payload.clientEventId,
    occurred_at: occurred.toISOString(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    accuracy_m: payload.accuracyM,
    device_id: payload.deviceId,
    branch_id: employee.branch_id,
    is_within_geofence: withinGeofence,
  });

  return NextResponse.json({ ok: true, attendanceId: attendance.id, status, isLate });
}
