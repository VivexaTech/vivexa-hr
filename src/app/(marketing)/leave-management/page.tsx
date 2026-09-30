import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Leave management",
  description: "Create leave types, track allocated and remaining balances, and approve requests in Vivexa HR.",
  path: "/leave-management",
});

export default function LeaveMarketingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Leave management", path: "/leave-management" },
        ])}
      />
      <PageHero
        title="Leave without the spreadsheet chase"
        description="Casual, sick, earned, unpaid, or custom types. Employees apply and see balances. HR approves. Allocated, used, and remaining stay in sync."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Leave management", href: "/leave-management" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          ["Employee self-service", "Apply, view history, and cancel a pending request when your policy allows it."],
          ["HR review", "Filter by status, approve or reject, and keep a note on the decision."],
          ["Work from home", "A separate request flow that can mark attendance as WFH when approved."],
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
