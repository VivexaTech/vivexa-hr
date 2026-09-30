import { OrgList } from "@/components/dashboard/org-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DesignationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!.from("designations").select("id, name, description").order("name");
  return (
    <>
      <PageHeader title="Designations" description="Manager, Executive, Developer, and custom titles." />
      <OrgList table="designations" rows={data ?? []} extraFields={[{ name: "description", label: "Description" }]} />
    </>
  );
}
