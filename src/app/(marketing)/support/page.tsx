import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Support",
  description: "Get help with Vivexa HR login, company setup, attendance, and employee access.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Support", path: "/support" }])} />
      <PageHero
        title="Support"
        description="Start with these common topics, or send a message from the contact page."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Support", href: "/support" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        <Card>
          <CardTitle>Login and access</CardTitle>
          <CardDescription>Use the same email you registered with. If you cannot sign in, reset the password from the login page.</CardDescription>
        </Card>
        <Card>
          <CardTitle>Company setup</CardTitle>
          <CardDescription>Complete onboarding to set working hours and add your first employees. The Free plan stops at five people.</CardDescription>
        </Card>
        <Link href="/contact">
          <Card className="h-full hover:border-brand/40">
            <CardTitle>Write to support</CardTitle>
            <CardDescription>Send a message and include your company name so we can find the right workspace.</CardDescription>
          </Card>
        </Link>
      </section>
    </>
  );
}
