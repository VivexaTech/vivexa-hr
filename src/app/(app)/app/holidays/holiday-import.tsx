"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/states";

export function HolidayImport() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="mb-6">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setMessage("");
          const response = await fetch("/api/holidays/import", { method: "POST", body: new FormData(event.currentTarget) });
          const payload = (await response.json()) as { created?: number; error?: string; errors?: string[] };
          if (!response.ok) {
            setError(payload.error || "Import failed.");
            return;
          }
          setMessage(`Imported ${payload.created ?? 0} holidays.`);
          router.refresh();
        }}
      >
        <label className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
          Import CSV (name, holiday_date, holiday_type)
          <input type="file" name="file" accept=".csv" className="hidden" onChange={(event) => event.currentTarget.form?.requestSubmit()} />
        </label>
      </form>
      {error ? <div className="mt-3"><Alert tone="error">{error}</Alert></div> : null}
      {message ? <div className="mt-3"><Alert>{message}</Alert></div> : null}
    </div>
  );
}
