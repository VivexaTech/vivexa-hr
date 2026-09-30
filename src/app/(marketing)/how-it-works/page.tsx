import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "How it works",
  description: "Register a company, set HR rules, add employees, and run attendance, leave, and payroll in Vivexa HR.",
  path: "/how-it-works",
});

const steps = [
  ["Create a company", "Register with the company name, contact details, and the owner account."],
  ["Set HR rules", "Choose working days, office timing, grace period, and leave types."],
  ["Add people", "Create employees individually or import a CSV or Excel file."],
  ["Daily operations", "Employees check in and request leave. HR reviews only what needs a decision."],
  ["Pay and records", "Run payroll from salary and attendance summaries. Keep document metadata with files in external storage."],
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ])}
      />
      <PageHero
        title="From first company to everyday HR"
        description="Vivexa HR is designed so the first hour is setup, and the rest of the month is exceptions — not data entry."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "How it works", href: "/how-it-works" },
        ]}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
        {steps.map(([title, text], index) => (
          <article key={title} className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm font-medium text-brand">Step {index + 1}</p>
            <h2 className="mt-2 font-display text-2xl text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
