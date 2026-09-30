import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function createNotification(input: {
  companyId: string;
  userId?: string | null;
  employeeId?: string | null;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
}) {
  const admin = createAdminSupabaseClient();
  if (!admin) return;

  await admin.from("notifications").insert({
    company_id: input.companyId,
    user_id: input.userId,
    employee_id: input.employeeId,
    title: input.title,
    body: input.body,
    type: input.type,
    data: input.data ?? {},
  });
}
