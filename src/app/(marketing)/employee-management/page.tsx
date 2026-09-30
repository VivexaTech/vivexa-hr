import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Employee management",
  description: "Add, import, search, and manage employee profiles, employment details, salary structures, and documents in Vivexa HR.",
  path: "/employee-management",
});

export default function EmployeeManagementPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Employee management", path: "/employee-management" },
        ])}
      />
      <PageHero
        title="A complete employee record"
        description="Personal details, employment, salary structure, and document metadata live together. HR can add, edit, deactivate, search, filter, import, and export."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Employee management", href: "/employee-management" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          ["Organization", "Departments, designations, branches, shifts, and reporting managers."],
          ["Plan limits", "The Free plan allows five employees. The database enforces the limit, not only the form."],
          ["Files", "Photos and letters are stored in Cloudinary or S3. The database stores links and access metadata."],
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
