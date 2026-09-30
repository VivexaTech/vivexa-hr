"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PlanRow = {
  id: string;
  name: string;
  slug: string;
  price_monthly: number | null;
  employee_limit: number;
  company_limit: number;
  storage_mb: number;
};

export function PlansEditor({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();

  return (
    <Table>
      <THead>
        <Th>Plan</Th>
        <Th>Monthly price</Th>
        <Th>Employees</Th>
        <Th>Companies</Th>
        <Th>Storage MB</Th>
        <Th></Th>
      </THead>
      <tbody>
        {plans.map((plan) => (
          <tr key={plan.id}>
            <Td>{plan.name}</Td>
            <Td colSpan={5}>
              <form
                className="flex flex-wrap gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const supabase = createBrowserSupabaseClient();
                  const form = new FormData(event.currentTarget);
                  const price = form.get("price_monthly");
                  await supabase!.from("plans").update({
                    price_monthly: price === "" ? null : Number(price),
                    employee_limit: Number(form.get("employee_limit")),
                    company_limit: Number(form.get("company_limit")),
                    storage_mb: Number(form.get("storage_mb")),
                  }).eq("id", plan.id);
                  router.refresh();
                }}
              >
                <Input name="price_monthly" type="number" defaultValue={plan.price_monthly ?? ""} placeholder="Contact us" className="w-28" />
                <Input name="employee_limit" type="number" defaultValue={plan.employee_limit} className="w-24" />
                <Input name="company_limit" type="number" defaultValue={plan.company_limit} className="w-24" />
                <Input name="storage_mb" type="number" defaultValue={plan.storage_mb} className="w-28" />
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
