import { OrgList } from "@/components/dashboard/org-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function BranchesPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!
    .from("branches")
    .select("id, name, city, geofence_radius_m, latitude, longitude")
    .order("name");
  return (
    <>
      <PageHeader title="Branches" description="Address, coordinates, and geofence radius per location." />
      <OrgList
        table="branches"
        rows={(data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          city: row.city ?? "",
          geofence_radius_m: String(row.geofence_radius_m),
        }))}
        extraFields={[
          { name: "city", label: "City" },
          { name: "latitude", label: "Latitude" },
          { name: "longitude", label: "Longitude" },
          { name: "geofence_radius_m", label: "Geofence (m)" },
        ]}
      />
    </>
  );
}
