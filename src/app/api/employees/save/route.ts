import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasPerm, requireCompanyContext } from "@/lib/services/require-company";
import { saveEmployeeRecord } from "@/lib/services/employees";
import { employeeSaveSchema } from "@/lib/validations/hr";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit("employees-save", 40, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many employee saves. Try again shortly." }, { status: 429 });
  }

  const auth = await requireCompanyContext(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const parsed = employeeSaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the employee details." }, { status: 400 });
  }

  const isEdit = Boolean(parsed.data.id);
  if (isEdit && !hasPerm(auth.ctx, "employees.edit")) {
    return NextResponse.json({ error: "You do not have permission to edit employees." }, { status: 403 });
  }
  if (!isEdit && !hasPerm(auth.ctx, "employees.create")) {
    return NextResponse.json({ error: "You do not have permission to add employees." }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const result = await saveEmployeeRecord(admin, auth.ctx.companyId, auth.ctx.userId, {
    id: parsed.data.id,
    fullName: parsed.data.fullName,
    employeeCode: parsed.data.employeeCode,
    email: parsed.data.email,
    phone: parsed.data.phone,
    dateOfBirth: parsed.data.dateOfBirth,
    gender: parsed.data.gender,
    joiningDate: parsed.data.joiningDate,
    employmentType: parsed.data.employmentType,
    employmentStatus: parsed.data.employmentStatus,
    departmentId: parsed.data.departmentId,
    designationId: parsed.data.designationId,
    branchId: parsed.data.branchId,
    reportingManagerId: parsed.data.reportingManagerId,
    address: parsed.data.address,
    emergencyContactName: parsed.data.emergencyContactName,
    emergencyContactPhone: parsed.data.emergencyContactPhone,
    photoUrl: parsed.data.photoUrl,
    basicSalary: parsed.data.basicSalary,
    createAccount: parsed.data.createAccount,
    resetPassword: parsed.data.resetPassword,
    password: parsed.data.password,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
  }

  return NextResponse.json({
    employeeId: result.employeeId,
    accountCreated: result.accountCreated ?? false,
  });
}
