"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function DocumentMetaForm({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      className="mt-4 grid gap-3 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const supabase = createBrowserSupabaseClient();
        const form = Object.fromEntries(new FormData(event.currentTarget).entries());
        const { error: saveError } = await supabase!.from("employee_documents").insert({
          employee_id: employeeId,
          document_type: form.document_type,
          title: form.title,
          file_url: form.file_url,
        });
        if (saveError) {
          setError("Unable to save document metadata. Check the URL and type.");
          return;
        }
        setError("");
        setMessage("Document metadata saved. The file stays in Cloudinary or S3.");
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      {error ? <div className="md:col-span-2"><Alert tone="error">{error}</Alert></div> : null}
      {message ? <div className="md:col-span-2"><Alert>{message}</Alert></div> : null}
      <div>
        <Label htmlFor="document_type">Type</Label>
        <select id="document_type" name="document_type" className="h-11 w-full rounded-lg border border-line px-3 text-sm" required>
          <option value="resume">Resume</option>
          <option value="offer_letter">Offer letter</option>
          <option value="joining_letter">Joining letter</option>
          <option value="certificate">Certificate</option>
          <option value="identity">Identity</option>
          <option value="photo">Photo</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="file_url">File URL</Label>
        <Input id="file_url" name="file_url" type="url" required placeholder="https://" />
      </div>
      <div>
        <Button type="submit">Save metadata</Button>
      </div>
    </form>
  );
}
