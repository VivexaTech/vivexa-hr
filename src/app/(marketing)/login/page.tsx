import { Suspense } from "react";
import { LoginForm } from "@/app/(marketing)/login/login-form";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Card } from "@/components/ui/card";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Login",
  description: "Sign in to the Vivexa HR dashboard for your company.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Login", path: "/login" }])} />
      <PageHero
        title="Login"
        description="Sign in to manage employees, attendance, leave, and payroll for your company."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Login", href: "/login" },
        ]}
      />
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Card>
          <Suspense>
            <LoginForm />
          </Suspense>
        </Card>
      </section>
    </>
  );
}
