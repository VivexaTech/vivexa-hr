import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Payroll",
  description: "Vivexa HR payroll uses salary structures, allowances, deductions, and attendance summaries. Calculations run on the server.",
  path: "/payroll",
});

export default function PayrollMarketingPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Payroll", path: "/payroll" }])} />
      <PageHero
        title="Payroll calculated where it belongs"
        description="Basic salary, allowances, deductions, unpaid leave, overtime, and bonuses are processed with server-side logic. Employees can view and download payslips when they are generated."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Payroll", href: "/payroll" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Card>
          <CardTitle>HR</CardTitle>
          <CardDescription>Generate a monthly run, review items, and manage payslips. Availability follows the company plan.</CardDescription>
        </Card>
        <Card>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Open the latest payslip in the Android app or the employee portal when your company publishes it.</CardDescription>
        </Card>
      </section>
      <CtaBand />
    </>
  );
}
