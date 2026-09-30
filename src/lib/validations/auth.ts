import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid work email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerAccountSchema = z.object({
  ownerName: z.string().min(2, "Enter the account owner's name."),
  email: z.string().email("Enter a valid work email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const companyBasicsSchema = z.object({
  companyName: z.string().min(2, "Enter the company name."),
  legalName: z.string().optional(),
  email: z.string().email("Enter a valid company email.").optional().or(z.literal("")),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().url("Enter a valid website URL.").optional().or(z.literal("")),
  gstin: z.string().optional(),
});

export const companySettingsSchema = z.object({
  officeStart: z.string().min(4),
  officeEnd: z.string().min(4),
  gracePeriodMinutes: z.coerce.number().int().min(0).max(180),
  workingDays: z.array(z.number().int().min(0).max(6)).min(1),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  companyName: z.string().optional(),
  message: z.string().min(10, "Please share a little more detail."),
});
