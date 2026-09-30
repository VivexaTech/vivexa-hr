import { EmployeeForm } from "../employee-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/session";
import { redirect } from "next/navigation";

export default async function NewEmployeePage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/app/onboarding");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const [{ data: departments }, { data: designations }, { data: branches }, { data: managers }] = await Promise.all([
    supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
    supabase.from("designations").select("id, name").eq("is_active", true).order("name"),
    supabase.from("branches").select("id, name").eq("is_active", true).order("name"),
    supabase.from("employees").select("id, full_name").eq("employment_status", "active").is("deleted_at", null).order("full_name"),
  ]);

  return (
    <>
      <PageHeader title="Add employee" description="Add the person, then optionally create their Vivexa HR login for the Android app." />
      <Card>
        <EmployeeForm
          companyId={user.companyId}
          departments={departments ?? []}
          designations={designations ?? []}
          branches={branches ?? []}
          managers={(managers ?? []).map((item) => ({ id: item.id, name: item.full_name }))}
        />
      </Card>
    </>
  );
}
