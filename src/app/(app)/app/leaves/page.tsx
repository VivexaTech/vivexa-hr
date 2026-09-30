import { LeaveActions } from "./leave-actions";
import { OrgList } from "@/components/dashboard/org-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function LeavesPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const [{ data: types }, { data: requests }] = await Promise.all([
    supabase.from("leave_types").select("id, name, code, annual_allocation").order("name"),
    supabase
      .from("leave_requests")
      .select("id, start_date, end_date, days, status, reason, employees(full_name), leave_types(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <>
      <PageHeader title="Leaves" description="Types, balances, and approvals. Remaining days update when a request is approved." />
      <h2 className="mb-3 font-display text-xl">Leave types</h2>
      <OrgList
        table="leave_types"
        rows={(types ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          code: row.code,
          annual_allocation: String(row.annual_allocation),
        }))}
        extraFields={[
          { name: "code", label: "Code" },
          { name: "annual_allocation", label: "Annual allocation", type: "number" },
        ]}
      />
      <h2 className="mt-10 mb-3 font-display text-xl">Requests</h2>
      {!requests?.length ? (
        <EmptyState title="No leave requests" description="Employees apply from the Android app. HR reviews them here." />
      ) : (
        <Table>
          <THead>
            <Th>Employee</Th>
            <Th>Type</Th>
            <Th>Dates</Th>
            <Th>Days</Th>
            <Th>Status</Th>
            <Th></Th>
          </THead>
          <tbody>
            {requests.map((row) => (
              <tr key={row.id}>
                <Td>{(row.employees as { full_name?: string } | null)?.full_name}</Td>
                <Td>{(row.leave_types as { name?: string } | null)?.name}</Td>
                <Td>
                  {formatDate(row.start_date)} – {formatDate(row.end_date)}
                </Td>
                <Td>{row.days}</Td>
                <Td>
                  <Badge tone={row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "default"}>
                    {row.status}
                  </Badge>
                </Td>
                <Td>{row.status === "pending" ? <LeaveActions id={row.id} /> : null}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
