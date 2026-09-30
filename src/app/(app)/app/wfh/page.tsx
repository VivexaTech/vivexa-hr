import { WfhActions } from "./wfh-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function WfhPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: requests } = await supabase
    .from("wfh_requests")
    .select("id, start_date, end_date, status, reason, employees(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <PageHeader
        title="Work from home"
        description="Employees request WFH. After approval, attendance is marked as WFH for those dates."
      />
      {!requests?.length ? (
        <EmptyState title="No WFH requests" description="Employees submit WFH from the Android app. Reviews appear here." />
      ) : (
        <Table>
          <THead>
            <Th>Employee</Th>
            <Th>Dates</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th></Th>
          </THead>
          <tbody>
            {requests.map((row) => (
              <tr key={row.id}>
                <Td>{(row.employees as { full_name?: string } | null)?.full_name}</Td>
                <Td>
                  {formatDate(row.start_date)} – {formatDate(row.end_date)}
                </Td>
                <Td>{row.reason}</Td>
                <Td>
                  <Badge tone={row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "default"}>
                    {row.status}
                  </Badge>
                </Td>
                <Td>{row.status === "pending" ? <WfhActions id={row.id} /> : null}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
