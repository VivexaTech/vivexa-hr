"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";

export function ContactForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    setSuccess("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        companyName: formData.get("companyName"),
        message: formData.get("message"),
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error || "Unable to send your message.");
      return;
    }
    setSuccess("Thanks. We received your message and will reply by email.");
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(new FormData(event.currentTarget));
      }}
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
      {success ? <Alert>{success}</Alert> : null}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="companyName">Company</Label>
        <Input id="companyName" name="companyName" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
        <FieldError />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
