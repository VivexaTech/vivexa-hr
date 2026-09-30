import { ContactForm } from "@/app/(marketing)/contact/contact-form";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Contact",
  description: "Contact Vivexa HR for product questions, support, or company onboarding help.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHero
        title="Contact Vivexa HR"
        description="Write to us about the product, onboarding, or support. We use this form to reach you by email."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <Card>
          <ContactForm />
        </Card>
      </section>
    </>
  );
}
