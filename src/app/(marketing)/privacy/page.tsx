import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { brand } from "@/constants/brand";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "How Vivexa HR handles company and employee information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])} />
      <PageHero
        title="Privacy Policy"
        description="Vivexa HR stores company HR data in isolated workspaces. Files such as photos and documents are kept in external object storage."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Privacy", href: "/privacy" },
        ]}
      />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-sm leading-7 text-muted sm:px-6">
        <h2 className="font-display text-2xl text-ink">What we store</h2>
        <p>Company profile, employee records, attendance, leave, payroll figures, notices, and document metadata. Authentication is handled by Supabase Auth.</p>
        <h2 className="font-display text-2xl text-ink">Access</h2>
        <p>Access is limited by company membership, roles, and permissions. Super administrators do not automatically receive employee personal files.</p>
        <h2 className="font-display text-2xl text-ink">Retention</h2>
        <p>Detailed attendance can be archived after a company-configured period. Monthly summaries remain so historical reports still work. Legal or payroll retention can prevent automatic deletion.</p>
        <p>{brand.poweredBy}.</p>
      </article>
    </>
  );
}
