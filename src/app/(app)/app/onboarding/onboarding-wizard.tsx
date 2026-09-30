"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export function OnboardingWizard({ step, companyId }: { step: number; companyId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <ol className="grid grid-cols-2 gap-2 text-xs">
        <li className={`rounded-full px-3 py-1 text-center ${step <= 4 ? "bg-brand text-white" : "bg-paper"}`}>HR settings</li>
        <li className={`rounded-full px-3 py-1 text-center ${step >= 5 ? "bg-brand text-white" : "bg-paper"}`}>Employees</li>
      </ol>
      {error ? <Alert tone="error">{error}</Alert> : null}

      {step <= 4 ? (
        <form
          className="space-y-4 rounded-2xl border border-line bg-white p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const supabase = createBrowserSupabaseClient();
            if (!supabase) {
              setError("Database is not configured.");
              return;
            }
            const form = new FormData(event.currentTarget);
            const workingDays = WEEKDAYS.filter((day) => form.get(`day_${day.value}`)).map((day) => day.value);
            if (!workingDays.length) {
              setError("Select at least one working day.");
              return;
            }
            setPending(true);
            const { error: saveError } = await supabase
              .from("company_settings")
              .update({
                office_start: form.get("office_start"),
                office_end: form.get("office_end"),
                grace_period_minutes: Number(form.get("grace_period_minutes")),
                late_mark_after_minutes: Number(form.get("grace_period_minutes")),
                working_days: workingDays,
                week_off_days: WEEKDAYS.map((day) => day.value).filter((value) => !workingDays.includes(value)),
              })
              .eq("company_id", companyId);
            if (saveError) {
              setPending(false);
              setError("Unable to save HR settings.");
              return;
            }
            await supabase.from("companies").update({ onboarding_step: 5 }).eq("id", companyId);
            setPending(false);
            router.refresh();
          }}
        >
          <h2 className="font-display text-2xl">Initial HR settings</h2>
          <p className="text-sm text-muted">
            Working hours and grace periods are used for attendance. They are not hard-coded in the product.
          </p>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Working days</legend>
            <div className="flex flex-wrap gap-3">
              {WEEKDAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`day_${day.value}`} defaultChecked={day.value >= 1 && day.value <= 5} />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="office_start">Office start</Label>
            <Input id="office_start" name="office_start" type="time" defaultValue="09:00" />
          </div>
          <div>
            <Label htmlFor="office_end">Office end</Label>
            <Input id="office_end" name="office_end" type="time" defaultValue="18:00" />
          </div>
          <div>
            <Label htmlFor="grace_period_minutes">Grace period (minutes)</Label>
            <Input id="grace_period_minutes" name="grace_period_minutes" type="number" defaultValue="15" />
            <p className="mt-1 text-xs text-muted">Example: start 09:00, grace 15 minutes, after 09:15 marked late.</p>
          </div>
          <p className="text-sm text-muted">
            Casual, sick, earned, and unpaid leave types are already created. You can edit allocations under Leaves.
          </p>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4 rounded-2xl border border-line bg-white p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setPending(true);
            const createAccount = form.get("createAccount") === "on";
            const response = await fetch("/api/employees/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fullName: form.get("full_name"),
                employeeCode: form.get("employee_code"),
                email: form.get("email"),
                employmentType: "full_time",
                employmentStatus: "active",
                createAccount,
                password: form.get("password") || "",
              }),
            });
            if (!response.ok) {
              setPending(false);
              const payload = (await response.json()) as { error?: string };
              setError(
                payload.error?.includes("limit")
                  ? "Free plan allows 5 employees."
                  : payload.error || "Unable to add the employee.",
              );
              return;
            }
            const supabase = createBrowserSupabaseClient();
            await supabase?.from("companies").update({ onboarding_step: 6, status: "active" }).eq("id", companyId);
            router.push("/app/dashboard");
            router.refresh();
          }}
        >
          <h2 className="font-display text-2xl">Add your first employee</h2>
          <p className="text-sm text-muted">
            You can import a CSV from Employees after this step. The Free plan allows up to 5 people.
          </p>
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div>
            <Label htmlFor="employee_code">Employee ID</Label>
            <Input id="employee_code" name="employee_code" required />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="createAccount" defaultChecked />
            Create employee app login
          </label>
          <div>
            <Label htmlFor="password">App password</Label>
            <Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" />
            <p className="mt-1 text-xs text-muted">Required if you create a login. The employee uses this on the Android app.</p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Finish setup"}
          </Button>
          <button
            type="button"
            className="block text-sm font-medium text-brand"
            onClick={async () => {
              const supabase = createBrowserSupabaseClient();
              await supabase?.from("companies").update({ onboarding_step: 6, status: "active" }).eq("id", companyId);
              router.push("/app/dashboard");
            }}
          >
            Skip for now
          </button>
          <Link href="/app/employees" className="block text-sm text-muted">
            Bulk import is available on the Employees page after setup.
          </Link>
        </form>
      )}
    </div>
  );
}
