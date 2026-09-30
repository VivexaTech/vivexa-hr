import { RegisterForm } from "@/app/(marketing)/register/register-form";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card } from "@/components/ui/card";
import { brand } from "@/constants/brand";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Company registration",
  description: `Register a company on Vivexa HR. ${brand.freePlanLabel}.`,
  path: "/register",
});

export default function RegisterPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Register", path: "/register" }])} />
      <PageHero
        title="Start Free"
        description={`${brand.freePlanLabel}. Create the company, then set working hours and add people.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Register", href: "/register" },
        ]}
      />
      <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <Card>
          <RegisterForm />
        </Card>
      </section>
    </>
  );
}
