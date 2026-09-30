import { OrgList } from "@/components/dashboard/org-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DepartmentsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!.from("departments").select("id, name, description").order("name");
  return (
    <>
      <PageHeader title="Departments" description="HR, IT, Sales, and any structure this company needs." />
      <OrgList table="departments" rows={data ?? []} extraFields={[{ name: "description", label: "Description" }]} />
    </>
  );
}
