import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/services/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function SuperAdminPage() {
  const user = await getCurrentUser();
  if (!user?.isSuperAdmin) redirect("/app/dashboard");
  const supabase = await createServerSupabaseClient();
  const { count } = await supabase!.from("companies").select("id", { count: "exact", head: true });
  const { data: plans } = await supabase!.from("plans").select("name, employee_limit, is_active");

  return (
    <>
      <PageHeader title="Platform overview" description="Super Admin can manage companies and plans. Employee personal files are not listed here." />
      <p className="mb-6 text-sm text-muted">{count ?? 0} companies on the platform.</p>
      <Table>
        <THead>
          <Th>Plan</Th>
          <Th>Employee limit</Th>
          <Th>Active</Th>
        </THead>
        <tbody>
          {(plans ?? []).map((plan) => (
            <tr key={plan.name}>
              <Td>{plan.name}</Td>
              <Td>{plan.employee_limit}</Td>
              <Td>{plan.is_active ? "Yes" : "No"}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-4 text-xs text-muted">Updated {formatDate(new Date().toISOString())}</p>
    </>
  );
}
