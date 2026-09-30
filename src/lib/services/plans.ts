import { fallbackPlans, type PricingPlan } from "@/constants/plans";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getPublicPlans(): Promise<PricingPlan[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return fallbackPlans;

  const { data: plans, error } = await supabase
    .from("plans")
    .select("slug, name, description, price_monthly, price_yearly, currency, company_limit, employee_limit, storage_mb, support_level, plan_features(feature_key, feature_label, enabled)")
    .eq("is_public", true)
    .eq("is_active", true)
    .order("sort_order");

  if (error || !plans?.length) return fallbackPlans;

  return plans.map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    description: plan.description ?? "",
    priceMonthly: plan.price_monthly === null ? null : Number(plan.price_monthly),
    priceYearly: plan.price_yearly === null ? null : Number(plan.price_yearly),
    currency: plan.currency,
    companyLimit: plan.company_limit,
    employeeLimit: plan.employee_limit,
    storageMb: plan.storage_mb,
    supportLevel: plan.support_level,
    highlighted: plan.slug === "startup",
    features: (plan.plan_features ?? []).map((feature) => ({
      key: feature.feature_key,
      label: feature.feature_label,
      enabled: feature.enabled,
    })),
  }));
}
