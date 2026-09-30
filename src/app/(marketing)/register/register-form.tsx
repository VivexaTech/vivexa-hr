"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { companyBasicsSchema, registerAccountSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [account, setAccount] = useState({ ownerName: "", email: "", password: "" });
  const [company, setCompany] = useState({
    companyName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    website: "",
    gstin: "",
  });

  return (
    <div className="space-y-6">
      <ol className="grid grid-cols-3 gap-2 text-xs text-muted">
        {["Company", "Details", "Owner"].map((label, index) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-center ${step === index + 1 ? "bg-brand text-white" : "bg-paper"}`}
          >
            {label}
          </li>
        ))}
      </ol>
      {error ? <Alert tone="error">{error}</Alert> : null}

      {step === 1 ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("companyName") || "");
            if (name.trim().length < 2) {
              setError("Enter the company name.");
              return;
            }
            setCompany((current) => ({ ...current, companyName: name.trim() }));
            setError("");
            setStep(2);
          }}
        >
          <div>
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" defaultValue={company.companyName} required />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = Object.fromEntries(new FormData(event.currentTarget).entries());
            const parsed = companyBasicsSchema.safeParse({ ...form, companyName: company.companyName });
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message || "Check company details.");
              return;
            }
            setCompany({
              companyName: parsed.data.companyName,
              email: parsed.data.email || "",
              phone: parsed.data.phone || "",
              addressLine1: parsed.data.addressLine1 || "",
              city: parsed.data.city || "",
              website: parsed.data.website || "",
              gstin: parsed.data.gstin || "",
            });
            setError("");
            setStep(3);
          }}
        >
          <div>
            <Label htmlFor="email">Company email</Label>
            <Input id="email" name="email" type="email" defaultValue={company.email} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={company.phone} />
          </div>
          <div>
            <Label htmlFor="addressLine1">Address</Label>
            <Input id="addressLine1" name="addressLine1" defaultValue={company.addressLine1} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={company.city} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={company.website} />
          </div>
          <div>
            <Label htmlFor="gstin">GSTIN (optional)</Label>
            <Input id="gstin" name="gstin" defaultValue={company.gstin} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = Object.fromEntries(new FormData(event.currentTarget).entries());
            const parsed = registerAccountSchema.safeParse(form);
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message || "Check account details.");
              return;
            }
            const supabase = createBrowserSupabaseClient();
            if (!supabase) {
              setError("Vivexa HR is not connected to the database yet. Add Supabase keys in the environment file.");
              return;
            }
            setPending(true);
            setAccount(parsed.data);
            const response = await fetch("/api/company/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...company,
                ownerName: parsed.data.ownerName,
                loginEmail: parsed.data.email,
                password: parsed.data.password,
              }),
            });
            if (!response.ok) {
              setPending(false);
              const payload = (await response.json()) as { error?: string };
              setError(payload.error || "Unable to create the company.");
              return;
            }
            const { error: signError } = await supabase.auth.signInWithPassword({
              email: parsed.data.email,
              password: parsed.data.password,
            });
            setPending(false);
            if (signError) {
              setError("Company created. Sign in from Login with the same email and password.");
              router.push("/login");
              return;
            }
            router.push("/app/onboarding");
            router.refresh();
          }}
        >
          <div>
            <Label htmlFor="ownerName">Owner / HR admin name</Label>
            <Input id="ownerName" name="ownerName" defaultValue={account.ownerName} required />
          </div>
          <div>
            <Label htmlFor="ownerEmail">Login email</Label>
            <Input id="ownerEmail" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Creating company…" : "Create company"}
            </Button>
          </div>
        </form>
      ) : null}

      <p className="text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-brand">
          Login
        </Link>
      </p>
    </div>
  );
}
