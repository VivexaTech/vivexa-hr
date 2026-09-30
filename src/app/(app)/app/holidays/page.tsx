import { HolidayImport } from "./holiday-import";
import { OrgList } from "@/components/dashboard/org-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HolidaysPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!.from("holidays").select("id, name, holiday_date, holiday_type").order("holiday_date");
  return (
    <>
      <PageHeader title="Holidays" description="Public, company, and optional holidays. Attendance recognizes these dates automatically." />
      <HolidayImport />
      <OrgList
        table="holidays"
        rows={(data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          holiday_date: row.holiday_date,
          holiday_type: row.holiday_type,
        }))}
        extraFields={[
          { name: "holiday_date", label: "Date", type: "date" },
          { name: "holiday_type", label: "Type" },
        ]}
      />
    </>
  );
}
