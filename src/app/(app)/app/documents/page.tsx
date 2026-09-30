import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("employee_documents")
    .select("id, document_type, title, file_url, created_at, employees(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Only metadata is stored here. Files live in Cloudinary or S3. Set STORAGE_PROVIDER in the environment."
      />
      {!data?.length ? (
        <EmptyState title="No documents yet" description="Upload offer letters, resumes, and IDs from the employee profile once storage credentials are configured." />
      ) : (
        <Table>
          <THead>
            <Th>Employee</Th>
            <Th>Type</Th>
            <Th>Title</Th>
            <Th>Added</Th>
            <Th>File</Th>
          </THead>
          <tbody>
            {data.map((doc) => (
              <tr key={doc.id}>
                <Td>{(doc.employees as { full_name?: string } | null)?.full_name}</Td>
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
      )}
    </>
  );
}
