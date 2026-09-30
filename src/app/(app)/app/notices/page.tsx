import { NoticeForm } from "./notice-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function NoticesPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!.from("notices").select("id, title, target, published_at").order("created_at", { ascending: false }).limit(50);

  return (
    <>
      <PageHeader title="Notices" description="Send announcements to everyone, a branch, a department, or selected people." />
      <NoticeForm />
      {!data?.length ? (
        <EmptyState title="No notices" description="Publish the first announcement for employees to see in the app." />
      ) : (
        <Table>
          <THead>
            <Th>Title</Th>
            <Th>Audience</Th>
            <Th>Published</Th>
          </THead>
          <tbody>
            {data.map((notice) => (
              <tr key={notice.id}>
                <Td>{notice.title}</Td>
                <Td>{notice.target}</Td>
                <Td>{formatDate(notice.published_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
