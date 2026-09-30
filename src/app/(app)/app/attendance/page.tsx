import { CorrectionActions } from "./correction-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  let query = supabase
    .from("attendance")
    .select("id, work_date, status, is_late, check_in_at, check_out_at, employees(full_name, employee_code)")
    .order("work_date", { ascending: false })
    .limit(50);
  if (from) query = query.gte("work_date", from);
  if (to) query = query.lte("work_date", to);
  const { data } = await query;

  const { data: corrections } = await supabase
    .from("attendance_corrections")
    .select("id, work_date, current_status, requested_status, status, reason, employees(full_name)")
    .eq("status", "pending")
    .limit(20);

  return (
    <>
      <PageHeader title="Attendance" description="Daily marks, late flags, and correction requests. Rules come from company settings." />
      <form className="mb-4 flex flex-wrap gap-3" action="/app/attendance">
        <input type="date" name="from" defaultValue={from} className="h-11 rounded-lg border border-line px-3 text-sm" />
        <input type="date" name="to" defaultValue={to} className="h-11 rounded-lg border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-lg bg-brand px-4 text-sm font-medium text-white">
          Filter
        </button>
      </form>
      {!data?.length ? (
        <EmptyState title="No attendance yet" description="Employees check in from the Android app. Server validation writes the official record." />
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Employee</Th>
            <Th>Status</Th>
            <Th>In</Th>
            <Th>Out</Th>
          </THead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <Td>{formatDate(row.work_date)}</Td>
                <Td>{(row.employees as { full_name?: string } | null)?.full_name}</Td>
                <Td>
                  <Badge tone={row.status === "late" || row.is_late ? "warning" : "success"}>{row.status}</Badge>
                </Td>
                <Td>{formatTime(row.check_in_at)}</Td>
                <Td>{formatTime(row.check_out_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <h2 className="mt-10 mb-3 font-display text-xl">Pending corrections</h2>
      {!corrections?.length ? (
        <p className="text-sm text-muted">No correction requests waiting.</p>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Employee</Th>
            <Th>Current</Th>
            <Th>Requested</Th>
            <Th>Reason</Th>
            <Th></Th>
          </THead>
          <tbody>
            {corrections.map((row) => (
              <tr key={row.id}>
                <Td>{formatDate(row.work_date)}</Td>
                <Td>{(row.employees as { full_name?: string } | null)?.full_name}</Td>
                <Td>{row.current_status}</Td>
                <Td>{row.requested_status}</Td>
                <Td>{row.reason}</Td>
                <Td>
                  <CorrectionActions id={row.id} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
