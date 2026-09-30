import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { brand } from "@/constants/brand";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";
import { getPublicPlans } from "@/lib/services/plans";

export const metadata = createMetadata({
  title: "Pricing",
  description: `${brand.freePlanLabel}. Startup, Business, and Enterprise limits are configurable by the platform administrator.`,
  path: "/pricing",
});

export default async function PricingPage() {
  const plans = await getPublicPlans();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />
      <PageHero
        title="Start free. Change plans later."
        description={`${brand.freePlanLabel}. Paid plan prices are stored in configuration so they can change without a code release. Payment collection can be added later.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Pricing", href: "/pricing" },
        ]}
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PricingGrid plans={plans} />
      </section>
      <CtaBand />
    </>
  );
}
