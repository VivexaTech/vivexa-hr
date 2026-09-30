"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";

export function PayrollRunForm() {
  const router = useRouter();
  const now = new Date();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        const response = await fetch("/api/payroll/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month: Number(form.get("month")),
            year: Number(form.get("year")),
          }),
        });
        const payload = (await response.json()) as { error?: string; employeeCount?: number };
        setPending(false);
        if (!response.ok) {
          setError(payload.error || "Unable to run payroll.");
          return;
        }
        setMessage(`Payroll completed for ${payload.employeeCount ?? 0} employees.`);
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="month">Month</Label>
        <Input id="month" name="month" type="number" min="1" max="12" defaultValue={now.getMonth() + 1} />
      </div>
      <div>
        <Label htmlFor="year">Year</Label>
        <Input id="year" name="year" type="number" defaultValue={now.getFullYear()} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Processing…" : "Run payroll"}
      </Button>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}
    </form>
  );
}
