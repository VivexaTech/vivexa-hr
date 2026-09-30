import { PayrollRunForm } from "./run-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PayrollPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: runs } = await supabase.from("payroll").select("id, month, year, status, processed_at").order("year", { ascending: false }).limit(12);
  const { data: items } = await supabase
    .from("payroll_items")
    .select("id, basic_salary, allowances, deductions, unpaid_leave_deduction, net_salary, employees(full_name)")
    .limit(50);

  return (
    <>
      <PageHeader title="Payroll" description="Net salary is calculated on the server from salary structures and monthly attendance summaries." />
      <PayrollRunForm />
      <h2 className="mb-3 font-display text-xl">Runs</h2>
      {!runs?.length ? (
        <EmptyState title="No payroll runs" description="Choose a month and process pay. This does not require a payment gateway." />
      ) : (
        <Table>
          <THead>
            <Th>Period</Th>
            <Th>Status</Th>
          </THead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <Td>
                  {run.month}/{run.year}
                </Td>
                <Td>{run.status}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <h2 className="mt-10 mb-3 font-display text-xl">Latest items</h2>
      <Table>
        <THead>
          <Th>Employee</Th>
          <Th>Basic</Th>
          <Th>Allowances</Th>
          <Th>Deductions</Th>
          <Th>Unpaid leave</Th>
          <Th>Net</Th>
        </THead>
        <tbody>
          {(items ?? []).map((item) => (
            <tr key={item.id}>
              <Td>{(item.employees as { full_name?: string } | null)?.full_name}</Td>
              <Td>{item.basic_salary}</Td>
              <Td>{item.allowances}</Td>
              <Td>{item.deductions}</Td>
              <Td>{item.unpaid_leave_deduction}</Td>
              <Td>{item.net_salary}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
