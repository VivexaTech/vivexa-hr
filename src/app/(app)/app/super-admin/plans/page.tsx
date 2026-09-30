import { redirect } from "next/navigation";
import { PlansEditor } from "./plans-editor";
import { PageHeader } from "@/components/dashboard/page-header";
import { getCurrentUser } from "@/lib/services/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SuperAdminPlansPage() {
  const user = await getCurrentUser();
  if (!user?.isSuperAdmin) redirect("/app/dashboard");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase!
    .from("plans")
    .select("id, name, slug, price_monthly, employee_limit, company_limit, storage_mb")
    .order("sort_order");

  return (
    <>
      <PageHeader
        title="Plans"
        description="Change prices and limits here. The public pricing page reads this catalog. Leave price empty to show Contact us."
      />
      <PlansEditor plans={data ?? []} />
    </>
  );
}
