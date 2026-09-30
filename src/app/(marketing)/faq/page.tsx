import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { faqs } from "@/constants/faq";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "FAQ",
  description: "Answers about Vivexa HR plans, attendance, employee limits, documents, and company data isolation.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqSchema(faqs),
        ]}
      />
      <PageHero
        title="Frequently asked questions"
        description="Short answers about the Free plan, company isolation, attendance, and documents."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "FAQ", href: "/faq" },
        ]}
      />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
        {faqs.map((item) => (
          <details key={item.question} className="rounded-2xl border border-line bg-white px-5 py-4">
            <summary className="cursor-pointer font-medium text-ink">{item.question}</summary>
            <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
          </details>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
