import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Enter the employee name."),
  employeeCode: z.string().min(1, "Enter an employee ID."),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  joiningDate: z.string().optional(),
  departmentId: z.string().uuid().optional().or(z.literal("")),
  designationId: z.string().uuid().optional().or(z.literal("")),
  branchId: z.string().uuid().optional().or(z.literal("")),
  reportingManagerId: z.string().uuid().optional().or(z.literal("")),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern", "consultant"]),
  employmentStatus: z.enum(["active", "inactive", "terminated", "on_notice"]),
  basicSalary: z.coerce.number().min(0).optional(),
  photoUrl: z.string().optional(),
  id: z.string().uuid().optional(),
  createAccount: z.boolean().optional(),
  resetPassword: z.boolean().optional(),
  password: z.string().optional().or(z.literal("")),
});

export const employeeSaveSchema = employeeSchema.superRefine((data, ctx) => {
  if ((data.createAccount || data.resetPassword) && (!data.email || data.email.length < 3)) {
    ctx.addIssue({ code: "custom", message: "Enter the employee’s work email to create a login.", path: ["email"] });
  }
  if ((data.createAccount || data.resetPassword) && (!data.password || data.password.length < 8)) {
    ctx.addIssue({
      code: "custom",
      message: "Set a password of at least 8 characters for the employee login.",
      path: ["password"],
    });
  }
});

export const orgItemSchema = z.object({
  name: z.string().min(2, "Enter a name."),
  description: z.string().optional(),
});

export const branchSchema = z.object({
  name: z.string().min(2, "Enter the branch name."),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  geofenceRadiusM: z.coerce.number().int().min(20).max(5000),
  officeStart: z.string().optional(),
  officeEnd: z.string().optional(),
});

export const shiftSchema = z.object({
  name: z.string().min(2),
  startTime: z.string(),
  endTime: z.string(),
  breakMinutes: z.coerce.number().int().min(0).max(240),
  gracePeriodMinutes: z.coerce.number().int().min(0).max(180),
  lateAfterMinutes: z.coerce.number().int().min(0).max(180),
  overtimeAfterMinutes: z.coerce.number().int().min(0).max(480),
});

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.coerce.number().positive().optional(),
  reason: z.string().min(3),
});

export const noticeSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(8),
  target: z.enum(["all", "branch", "department", "employees"]),
  branchId: z.string().uuid().optional().or(z.literal("")),
  departmentId: z.string().uuid().optional().or(z.literal("")),
});

export const holidaySchema = z.object({
  name: z.string().min(2),
  holidayDate: z.string(),
  holidayType: z.enum(["public", "company", "optional"]),
});

export const correctionSchema = z.object({
  workDate: z.string(),
  requestedStatus: z.enum([
    "present",
    "late",
    "half_day",
    "absent",
    "leave",
    "holiday",
    "week_off",
    "wfh",
    "on_duty",
  ]),
  reason: z.string().min(5),
});
