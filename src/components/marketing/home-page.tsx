import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Smartphone,
  Users,
  Wallet,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CtaBand } from "@/components/marketing/cta-band";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { brand } from "@/constants/brand";
import { faqs } from "@/constants/faq";
import type { PricingPlan } from "@/constants/plans";

const features = [
  { href: "/employee-management", title: "Employee management", text: "Keep profiles, roles, and employment details in one place.", icon: Users },
  { href: "/attendance", title: "Attendance", text: "Check-in, late rules, shifts, and geofencing defined by your company.", icon: ClipboardCheck },
  { href: "/leave-management", title: "Leave management", text: "Apply, approve, and track balances without spreadsheet follow-up.", icon: CalendarDays },
  { href: "/payroll", title: "Payroll", text: "Calculate pay on the server from salary, attendance, and leave data.", icon: Wallet },
  { href: "/features", title: "Documents", text: "Store offer letters and certificates outside the database.", icon: FolderOpen },
  { href: "/features", title: "Reports", text: "Filter, paginate, and export attendance, leave, and payroll reports.", icon: BarChart3 },
];

export function HomePage({ plans }: { plans: PricingPlan[] }) {
  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-sm font-medium text-brand">{brand.freePlanLabel}</p>
            <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink sm:text-6xl">
              {brand.tagline}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">{brand.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Start Free</Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="secondary">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
          <Card className="bg-white">
            <p className="text-sm font-medium text-brand">HR dashboard</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                ["Employees", "Directory, roles, branches"],
                ["Today", "Present, late, on leave"],
                ["Requests", "Leave and corrections"],
                ["Payroll", "Server-side calculations"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl bg-paper p-4">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-3xl text-ink">HR work should not live in chat threads</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            Attendance, leave, and documents are often scattered across spreadsheets and messages. Vivexa HR gives each
            company a single workspace so people, time, and pay stay connected — without mixing one company&apos;s data
            with another.
          </p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Why Vivexa HR</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Built for companies", "Every record belongs to a company. Isolation is enforced in the database, not only in the interface."],
              ["Less manual HR", "Employees submit requests. Rules validate them. HR approves only when needed."],
              ["Ready to grow", "Start free with five employees. Plans, limits, and features can change later without rewriting the product."],
            ].map(([title, text]) => (
              <Card key={title}>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Core features</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="h-full transition-colors group-hover:border-brand/40">
                  <feature.icon className="h-5 w-5 text-brand" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.text}</CardDescription>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-ink">Smart attendance</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Working hours, grace periods, and geofences come from company settings — they are not hard-coded. Check-in
              events carry a unique id so a retry after a poor network does not create a duplicate mark.
            </p>
          </div>
          <Card>
            <p className="text-sm text-muted">Example rule</p>
            <p className="mt-3 text-ink">Office start 09:00 · Grace 15 minutes · After 09:15 marked late</p>
          </Card>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <Card>
            <Smartphone className="h-6 w-6 text-brand" />
            <CardTitle className="mt-4">Employee Android app</CardTitle>
            <CardDescription>
              Employees check in, apply for leave, read notices, and open payslips on Android. Package name{" "}
              {brand.androidPackage}.
            </CardDescription>
          </Card>
          <div>
            <h2 className="font-display text-3xl text-ink">An app for the people who mark attendance</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              The phone handles poor networks with a pending local state. The server still decides whether the event is
              valid.
            </p>
            <Link href="/employee-app" className="mt-6 inline-block text-sm font-medium text-brand">
              See the employee app
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">HR dashboard</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            See who is in today, who is late, who is on leave, and which requests need a decision. Tables stay
            searchable and paginated so large directories stay usable.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            ["Leave management", "Balances stay current as requests are approved or cancelled."],
            ["Payroll", "Net pay is calculated on the server from salary components and attendance summaries."],
            ["Documents", "Metadata stays in Vivexa HR. Files stay in Cloudinary or S3-compatible storage."],
          ].map(([title, text]) => (
            <Card key={title}>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Reports that stay fast</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Attendance, leave, employee, department, branch, and payroll reports use filters, date ranges, and exports.
            Large lists are queried in pages, not loaded all at once.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {["Register your company", "Set working hours and leave policy", "Add employees or import a file", "Let people check in and request leave"].map(
              (step, index) => (
                <li key={step} className="rounded-2xl border border-line bg-paper p-5">
                  <p className="text-sm font-medium text-brand">Step {index + 1}</p>
                  <p className="mt-3 font-medium text-ink">{step}</p>
                </li>
              ),
            )}
          </ol>
          <Link href="/how-it-works" className="mt-6 inline-block text-sm font-medium text-brand">
            Read the full walkthrough
          </Link>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Pricing preview</h2>
          <p className="mt-3 text-sm text-muted">
            Startup, Business, and Enterprise prices are configured by the platform administrator and are not hard-coded
            into the product.
          </p>
          <div className="mt-8">
            <PricingGrid plans={plans} />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.slice(0, 5).map((item) => (
              <details key={item.question} className="rounded-2xl border border-line bg-paper px-5 py-4">
                <summary className="cursor-pointer font-medium text-ink">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">
            <FileText className="h-4 w-4" />
            View all FAQs
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
