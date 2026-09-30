import { SettingsForm } from "./settings-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/session";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/app/onboarding");
  const supabase = await createServerSupabaseClient();
  const { data: settings } = await supabase!.from("company_settings").select("*").maybeSingle();
  const { data: usage } = await supabase!.from("company_usage").select("employee_count").maybeSingle();
  const { data: subscription } = await supabase!
    .from("subscriptions")
    .select("status, plans(name, employee_limit)")
    .maybeSingle();

  return (
    <>
      <PageHeader title="Settings" description="Working hours, geofencing, and attendance retention for this company." />
      <Card className="mb-6">
        <p className="text-sm text-muted">
          Plan: {(subscription?.plans as { name?: string } | null)?.name || "Free"} · Employees used: {usage?.employee_count ?? 0} /{" "}
          {(subscription?.plans as { employee_limit?: number } | null)?.employee_limit ?? 5}
        </p>
      </Card>
      {settings ? (
        <SettingsForm companyId={user.companyId} settings={settings} />
      ) : (
        <p className="text-sm text-muted">Settings will appear after company onboarding.</p>
      )}
    </>
  );
}
