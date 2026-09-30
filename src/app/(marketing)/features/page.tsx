import Link from "next/link";
import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Features",
  description: "Explore Vivexa HR features for employees, attendance, leave, payroll, documents, reports, and company settings.",
  path: "/features",
});

const items = [
  { href: "/employee-management", title: "Employee management", text: "Profiles, employment details, search, filters, and bulk import." },
  { href: "/attendance", title: "Attendance", text: "Check-in, statuses, shifts, geofencing, and correction requests." },
  { href: "/leave-management", title: "Leave management", text: "Leave types, balances, approvals, and history." },
  { href: "/payroll", title: "Payroll", text: "Salary structures, server-side net pay, and payslips." },
  { href: "/employee-app", title: "Employee Android app", text: "Attendance, leave, notices, and payslips on the phone." },
  { href: "/how-it-works", title: "Company settings", text: "Working days, office timing, and attendance rules per company." },
];

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Features", path: "/features" }])} />
      <PageHero
        title="Everything HR needs in one product"
        description="Vivexa HR covers the daily work of managing people: records, time, leave, pay, files, and notices — with permissions instead of a single hard-coded role."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Features", href: "/features" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:border-brand/40">
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.text}</CardDescription>
            </Card>
          </Link>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
