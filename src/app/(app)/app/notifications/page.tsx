import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/states";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/session";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!
    .from("notifications")
    .select("id, title, body, created_at, read_at")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <PageHeader title="Notifications" description="Leave decisions, attendance, notices, and payslip events appear here. Push delivery can use Expo/FCM later." />
      {!data?.length ? (
        <EmptyState title="No notifications" description="Approvals and company notices will show up as they happen." />
      ) : (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.id} className="rounded-2xl border border-line bg-white p-4">
              <p className="font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(item.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
