import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPlanPrice, type PricingPlan } from "@/constants/plans";
import { cn } from "@/lib/utils";

export function PricingGrid({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.slug}
          className={cn("flex flex-col", plan.highlighted && "border-brand ring-1 ring-brand/20")}
        >
          <p className="text-sm font-medium text-brand">{plan.name}</p>
          <p className="mt-3 font-display text-3xl text-ink">{formatPlanPrice(plan)}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{plan.description}</p>
          <ul className="mt-6 space-y-2 text-sm text-ink">
            <li>
              {plan.companyLimit} {plan.companyLimit === 1 ? "company" : "companies"}
            </li>
            <li>Up to {plan.employeeLimit} employees</li>
            <li>{plan.storageMb >= 1024 ? `${plan.storageMb / 1024} GB` : `${plan.storageMb} MB`} file storage</li>
            {plan.features
              .filter((feature) => feature.enabled)
              .slice(0, 6)
              .map((feature) => (
                <li key={feature.key} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-brand" />
                  <span>{feature.label}</span>
                </li>
              ))}
          </ul>
          <div className="mt-8">
            <Link href={plan.slug === "free" ? "/register" : "/contact"}>
              <Button variant={plan.highlighted ? "primary" : "secondary"} className="w-full">
                {plan.slug === "free" ? "Start Free" : "Talk to us"}
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
