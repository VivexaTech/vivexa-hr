import { OnboardingWizard } from "./onboarding-wizard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/session";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.companyId) redirect("/register");
  const supabase = await createServerSupabaseClient();
  const { data: company } = await supabase!.from("companies").select("onboarding_step, status").eq("id", user.companyId).single();
  if (company?.status === "active" && (company.onboarding_step ?? 0) >= 6) redirect("/app/dashboard");

  return (
    <div>
      <h1 className="mb-6 text-center font-display text-3xl">Set up your company</h1>
      <OnboardingWizard step={company?.onboarding_step ?? 4} companyId={user.companyId} />
    </div>
  );
}
