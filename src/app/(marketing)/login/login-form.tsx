"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { loginErrorMessage } from "@/lib/auth-errors";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/app/dashboard";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const form = new FormData(event.currentTarget);
        const parsed = loginSchema.safeParse({
          email: form.get("email"),
          password: form.get("password"),
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || "Check your details.");
          return;
        }
        const supabase = createBrowserSupabaseClient();
        if (!supabase) {
          setError("Vivexa HR is not connected to the database yet. Add Supabase keys in the environment file.");
          return;
        }
        setPending(true);
        const { error: signError } = await supabase.auth.signInWithPassword(parsed.data);
        setPending(false);
        if (signError) {
          setError(loginErrorMessage(signError));
          return;
        }
        router.push(next);
        router.refresh();
      }}
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Login"}
      </Button>
      <p className="text-sm text-muted">
        New company?{" "}
        <Link href="/register" className="font-medium text-brand">
          Start Free
        </Link>
      </p>
    </form>
  );
}
