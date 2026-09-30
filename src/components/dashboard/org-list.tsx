"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { EmptyState, Alert } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function OrgList({
  table,
  rows,
  extraFields = [],
}: {
  table: "departments" | "designations" | "branches" | "shifts" | "leave_types" | "holidays";
  rows: Record<string, string>[];
  extraFields?: { name: string; label: string; type?: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const supabase = createBrowserSupabaseClient();
          if (!supabase) return;
          const form = Object.fromEntries(new FormData(event.currentTarget).entries());
          const { error: saveError } = await supabase.from(table).insert(form);
          if (saveError) {
            setError("Unable to save. Check for a duplicate name.");
            return;
          }
          setError("");
          event.currentTarget.reset();
          router.refresh();
        }}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        {extraFields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input id={field.name} name={field.name} type={field.type || "text"} />
          </div>
        ))}
        <div className="flex items-end">
          <Button type="submit">Add</Button>
        </div>
      </form>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {!rows.length ? (
        <EmptyState title="Nothing here yet" description="Add the first item to start organizing this company." />
      ) : (
        <Table>
          <THead>
            <Th>Name</Th>
            {extraFields.map((field) => (
              <Th key={field.name}>{field.label}</Th>
            ))}
          </THead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.name}</Td>
                {extraFields.map((field) => (
                  <Td key={field.name}>{row[field.name] || "—"}</Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
