import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { brand } from "@/constants/brand";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms and Conditions",
  description: "Terms of use for the Vivexa HR platform operated by Vivexa Tech.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }])} />
      <PageHero
        title="Terms and Conditions"
        description="These terms apply to companies and users who access Vivexa HR."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Terms", href: "/terms" },
        ]}
      />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-sm leading-7 text-muted sm:px-6">
        <p>By creating a company or signing in, you agree to use {brand.productName} only for legitimate HR operations for your organization.</p>
        <h2 className="font-display text-2xl text-ink">Accounts</h2>
        <p>The company owner is responsible for who is invited, which roles are assigned, and how employee personal data is used.</p>
        <h2 className="font-display text-2xl text-ink">Plans and limits</h2>
        <p>The Free plan is limited to one company and five employees. Additional limits come from the active plan record, which can be updated by the platform administrator.</p>
        <h2 className="font-display text-2xl text-ink">Acceptable use</h2>
        <p>You must not attempt to access another company&apos;s data, bypass attendance validation, or upload unlawful content.</p>
        <p>{brand.poweredBy}.</p>
      </article>
    </>
  );
}
