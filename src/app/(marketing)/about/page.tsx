import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description: "Vivexa HR is an HR management platform from Vivexa Tech for companies that want one place for people, time, and pay.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <PageHero
        title="About Vivexa HR"
        description="Vivexa HR is built by Vivexa Tech for companies that want HR operations in one workspace — without treating every tenant as a single shared database."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          ["Who it is for", "HR teams, founders, and managers who need employee records, attendance, leave, and payroll in one product."],
          ["What it is not", "It is not a generic spreadsheet template. Company data is isolated, and business rules run on the server."],
          ["How we talk about it", "We do not publish invented customer counts or reviews. The Free plan is exactly one company and five employees."],
        ].map(([title, text]) => (
          <Card key={title}>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{text}</CardDescription>
          </Card>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
