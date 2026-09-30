import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { brand } from "@/constants/brand";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Employee Android app",
  description: "The Vivexa HR Android app lets employees check in, apply for leave, read notices, and view payslips.",
  path: "/employee-app",
});

export default function EmployeeAppPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Employee app", path: "/employee-app" },
        ])}
      />
      <PageHero
        title="The employee app for daily HR"
        description={`Employees use the Android app to mark attendance, request leave, and stay informed. Package name ${brand.androidPackage}.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Employee app", href: "/employee-app" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        {[
          ["Dashboard", "Today’s attendance, working hours, leave balance, next holiday, and recent notices."],
          ["Attendance", "Check-in and check-out with pending sync when the network is weak."],
          ["Leave", "Apply, see balances, and track request status."],
          ["Payslips and documents", "Open published payslips and personal documents when HR has shared them."],
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
