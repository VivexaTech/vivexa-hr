import { OrgList } from "@/components/dashboard/org-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ShiftsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!.from("shifts").select("id, name, start_time, end_time, grace_period_minutes").order("name");
  return (
    <>
      <PageHeader title="Shifts" description="Start time, end time, break, and grace period. Employees can be assigned later." />
      <OrgList
        table="shifts"
        rows={(data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          start_time: String(row.start_time).slice(0, 5),
          end_time: String(row.end_time).slice(0, 5),
        }))}
        extraFields={[
          { name: "start_time", label: "Start", type: "time" },
          { name: "end_time", label: "End", type: "time" },
          { name: "break_minutes", label: "Break (min)", type: "number" },
          { name: "grace_period_minutes", label: "Grace (min)", type: "number" },
        ]}
      />
    </>
  );
}
