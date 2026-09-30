import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Attendance management",
  description: "Vivexa HR attendance supports check-in, late rules, geofencing, shifts, corrections, and monthly summaries.",
  path: "/attendance",
});

export default function AttendanceMarketingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Attendance", path: "/attendance" },
        ])}
      />
      <PageHero
        eyebrow="Attendance"
        title="Attendance that follows your office rules"
        description="Set office start time, grace period, shifts, and geofence radius for each company. After 09:15 can mean late — if that is what you configured."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Attendance", href: "/attendance" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          ["Statuses that match real days", "Present, late, half day, absent, leave, holiday, week off, work from home, and on duty."],
          ["Validated on the server", "Identity, device, location, branch, and timestamp are checked before a mark is accepted."],
          ["Corrections with an audit trail", "Employees request a change. HR approves or rejects. Every decision is logged."],
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
