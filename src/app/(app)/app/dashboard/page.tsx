import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/services/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/app/onboarding");

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [{ count: totalEmployees }, { data: todayAttendance }, { count: pendingLeaves }, { data: activities }] =
    await Promise.all([
      supabase.from("employees").select("id", { count: "exact", head: true }).is("deleted_at", null).neq("employment_status", "terminated"),
      supabase.from("attendance").select("status, is_late").eq("work_date", today),
      supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("audit_logs").select("action, entity, created_at").order("created_at", { ascending: false }).limit(8),
    ]);

  const present = todayAttendance?.filter((row) => ["present", "late", "wfh", "on_duty"].includes(row.status)).length ?? 0;
  const late = todayAttendance?.filter((row) => row.is_late || row.status === "late").length ?? 0;
  const onLeave = todayAttendance?.filter((row) => row.status === "leave").length ?? 0;
  const marked = todayAttendance?.length ?? 0;
  const absent = Math.max((totalEmployees ?? 0) - marked, 0);
  const percentage = totalEmployees ? Math.round((present / totalEmployees) * 100) : 0;

  return (
    <>
      <PageHeader title="Dashboard" description="Today’s people, time, and pending work." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total employees" value={totalEmployees ?? 0} />
        <StatCard label="Present today" value={present} />
        <StatCard label="Absent today" value={absent} />
        <StatCard label="Late today" value={late} />
        <StatCard label="On leave" value={onLeave} />
        <StatCard label="Pending leave requests" value={pendingLeaves ?? 0} />
        <StatCard label="Attendance %" value={`${percentage}%`} />
      </div>
      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl text-ink">Recent activity</h2>
        {activities?.length ? (
          <Table>
            <THead>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>When</Th>
            </THead>
            <tbody>
              {activities.map((item, index) => (
                <tr key={`${item.action}-${index}`}>
                  <Td>{item.action}</Td>
                  <Td>{item.entity}</Td>
                  <Td>{formatDate(item.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState title="No activity yet" description="Company setup, employee changes, and approvals will appear here." />
        )}
      </div>
      <Card className="mt-6">
        <p className="text-sm text-muted">
          Core modules stay available on the Free plan. Employee creation is blocked by the database when you reach five
          people.
        </p>
      </Card>
    </>
  );
}
