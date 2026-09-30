"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";

export function EmployeeToolbar() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const q = String(form.get("q") || "");
          const status = String(form.get("status") || "");
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (status) params.set("status", status);
          router.push(params.toString() ? `/app/employees?${params}` : "/app/employees");
        }}
      >
        <Input name="q" placeholder="Search name, email, or employee ID" />
        <select name="status" className="h-11 rounded-lg border border-line px-3 text-sm" defaultValue="">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_notice">On notice</option>
          <option value="terminated">Terminated</option>
        </select>
      </form>
      <div className="flex flex-wrap gap-2">
        <a href="/api/employees/export" className="rounded-lg border border-line px-3 py-2 text-sm">
          Export CSV
        </a>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            const form = event.currentTarget;
            const data = new FormData(form);
            const response = await fetch("/api/employees/import", { method: "POST", body: data });
            const payload = (await response.json()) as { created?: number; errors?: string[]; error?: string };
            if (!response.ok) {
              setError(payload.error || "Import failed.");
              return;
            }
            setMessage(`Imported ${payload.created ?? 0} employees.`);
            router.refresh();
          }}
        >
          <label className="rounded-lg border border-line px-3 py-2 text-sm">
            Import CSV
            <input type="file" name="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => event.currentTarget.form?.requestSubmit()} />
          </label>
        </form>
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}
    </div>
  );
}
