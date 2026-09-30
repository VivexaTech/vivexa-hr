import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/services/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function SuperAdminCompaniesPage() {
  const user = await getCurrentUser();
  if (!user?.isSuperAdmin) redirect("/app/dashboard");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!
    .from("companies")
    .select("id, name, status, created_at, email")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader title="Companies" description="Platform metadata only. Open a company workspace only through a controlled support process." />
      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Status</Th>
          <Th>Email</Th>
          <Th>Created</Th>
        </THead>
        <tbody>
          {(data ?? []).map((company) => (
            <tr key={company.id}>
              <Td>{company.name}</Td>
              <Td>{company.status}</Td>
              <Td>{company.email}</Td>
              <Td>{formatDate(company.created_at)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
