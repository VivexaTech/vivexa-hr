import { notFound, redirect } from "next/navigation";
import { DocumentMetaForm } from "../document-meta-form";
import { EmployeeForm } from "../employee-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/session";
import { formatDate } from "@/lib/utils";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/app/onboarding");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: employee } = await supabase.from("employees").select("*").eq("id", id).maybeSingle();
  if (!employee) notFound();

  const [{ data: departments }, { data: designations }, { data: branches }, { data: managers }, { data: documents }] =
    await Promise.all([
      supabase.from("departments").select("id, name").order("name"),
      supabase.from("designations").select("id, name").order("name"),
      supabase.from("branches").select("id, name").order("name"),
      supabase.from("employees").select("id, full_name").neq("id", id).order("full_name"),
      supabase.from("employee_documents").select("id, document_type, title, file_url, created_at").eq("employee_id", id).order("created_at", { ascending: false }),
    ]);

  return (
    <>
      <PageHeader title={employee.full_name} description={`Employee ID ${employee.employee_code}`} />
      <Card>
        <EmployeeForm
          companyId={user.companyId}
          initial={employee}
          departments={departments ?? []}
          designations={designations ?? []}
          branches={branches ?? []}
          managers={(managers ?? []).map((item) => ({ id: item.id, name: item.full_name }))}
        />
      </Card>
      <Card className="mt-6">
        <h2 className="font-display text-xl">Documents</h2>
        <p className="mt-1 text-sm text-muted">Store the file in Cloudinary or S3, then save the URL here.</p>
        <DocumentMetaForm employeeId={id} />
        {(documents ?? []).length ? (
          <div className="mt-6">
            <Table>
              <THead>
                <Th>Type</Th>
                <Th>Title</Th>
                <Th>Added</Th>
                <Th>File</Th>
              </THead>
              <tbody>
                {documents!.map((doc) => (
                  <tr key={doc.id}>
                    <Td>{doc.document_type}</Td>
                    <Td>{doc.title}</Td>
                    <Td>{formatDate(doc.created_at)}</Td>
                    <Td>
                      <a href={doc.file_url} className="text-brand" target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : null}
      </Card>
    </>
  );
}
