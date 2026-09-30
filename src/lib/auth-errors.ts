import { z } from "zod";
import { companyBasicsSchema, registerAccountSchema } from "@/lib/validations/auth";

export const registerCompanyRequestSchema = companyBasicsSchema.and(
  registerAccountSchema.pick({ ownerName: true, password: true }).extend({
    loginEmail: z.string().email("Enter a valid work email."),
  }),
);

export function loginErrorMessage(error: { message?: string; code?: string } | null) {
  const message = (error?.message || "").toLowerCase();
  const code = error?.code || "";
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "This email is not confirmed yet. Open Start Free and complete registration with the same email, or confirm the user in Supabase Authentication.";
  }
  if (code === "invalid_credentials" || message.includes("invalid login") || message.includes("invalid_grant")) {
    return "Email or password is incorrect.";
  }
  return "Unable to sign in. Check your details and try again.";
}
