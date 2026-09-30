"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function NoticeForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <form
      className="mb-8 space-y-3 rounded-2xl border border-line bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const supabase = createBrowserSupabaseClient();
        const form = Object.fromEntries(new FormData(event.currentTarget).entries());
        const { error: saveError } = await supabase!.from("notices").insert({
          title: form.title,
          body: form.body,
          target: form.target,
          published_at: new Date().toISOString(),
        });
        if (saveError) {
          setError("Unable to publish the notice.");
          return;
        }
        setError("");
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="body">Message</Label>
        <Textarea id="body" name="body" required />
      </div>
      <div>
        <Label htmlFor="target">Audience</Label>
        <select id="target" name="target" className="h-11 w-full rounded-lg border border-line px-3 text-sm">
          <option value="all">All employees</option>
          <option value="branch">Branch</option>
          <option value="department">Department</option>
          <option value="employees">Specific employees</option>
        </select>
      </div>
      <Button type="submit">Publish notice</Button>
    </form>
  );
}
