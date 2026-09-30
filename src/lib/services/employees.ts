import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications";

export type EmployeeInput = {
  id?: string;
  fullName: string;
  employeeCode: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  joiningDate?: string | null;
  employmentType: string;
  employmentStatus: string;
  departmentId?: string | null;
  designationId?: string | null;
  branchId?: string | null;
  reportingManagerId?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  photoUrl?: string | null;
  basicSalary?: number | null;
  createAccount?: boolean;
  resetPassword?: boolean;
  password?: string | null;
};

function emptyToNull(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

export async function saveEmployeeRecord(
  admin: SupabaseClient,
  companyId: string,
  actorId: string,
  input: EmployeeInput,
) {
  const payload = {
    company_id: companyId,
    full_name: input.fullName.trim(),
    employee_code: input.employeeCode.trim(),
    email: emptyToNull(input.email)?.toLowerCase() ?? null,
    phone: emptyToNull(input.phone),
    date_of_birth: emptyToNull(input.dateOfBirth),
    gender: input.gender || null,
    joining_date: emptyToNull(input.joiningDate),
    employment_type: input.employmentType,
    employment_status: input.employmentStatus,
    department_id: emptyToNull(input.departmentId),
    designation_id: emptyToNull(input.designationId),
    branch_id: emptyToNull(input.branchId),
    reporting_manager_id: emptyToNull(input.reportingManagerId),
    address: emptyToNull(input.address),
    emergency_contact_name: emptyToNull(input.emergencyContactName),
    emergency_contact_phone: emptyToNull(input.emergencyContactPhone),
    photo_url: emptyToNull(input.photoUrl),
  };

  const query = input.id
    ? admin.from("employees").update(payload).eq("id", input.id).eq("company_id", companyId)
    : admin.from("employees").insert(payload);

  const { data: saved, error } = await query.select("id, user_id, email, full_name").single();
  if (error || !saved) {
    if (error?.message?.includes("Employee limit")) {
      return { error: "The current plan employee limit has been reached.", status: 422 as const };
    }
    if (error?.message?.toLowerCase().includes("duplicate") || error?.code === "23505") {
      return { error: "That employee ID is already in use.", status: 409 as const };
    }
    return { error: "Unable to save the employee.", status: 400 as const };
  }

  if (input.basicSalary != null && Number.isFinite(input.basicSalary)) {
    await admin.from("salary_structures").upsert(
      {
        company_id: companyId,
        employee_id: saved.id,
        basic_salary: input.basicSalary,
      },
      { onConflict: "employee_id" },
    );
  }

  let accountCreated = false;
  if (input.createAccount || (input.resetPassword && saved.user_id)) {
    const result = await provisionEmployeeAccount(admin, {
      companyId,
      employeeId: saved.id,
      existingUserId: saved.user_id,
      email: payload.email,
      password: input.password,
      fullName: payload.full_name,
      resetPassword: Boolean(input.resetPassword && saved.user_id),
    });
    if (result.error) return { error: result.error, status: result.status, employeeId: saved.id };
    accountCreated = result.created;
  }

  await writeAudit({
    companyId,
    actorId,
    action: input.id ? "employee.updated" : "employee.created",
    entity: "employees",
    entityId: saved.id,
    newValue: { name: payload.full_name, accountCreated },
  });

  return { employeeId: saved.id, accountCreated };
}

async function provisionEmployeeAccount(
  admin: SupabaseClient,
  input: {
    companyId: string;
    employeeId: string;
    existingUserId: string | null;
    email: string | null;
    password?: string | null;
    fullName: string;
    resetPassword: boolean;
  },
) {
  if (!input.email) {
    return { error: "An email is required to create an employee login.", status: 400 as const };
  }
  if (!input.password || input.password.length < 8) {
    return { error: "Set a password of at least 8 characters for the employee login.", status: 400 as const };
  }

  let userId = input.existingUserId;

  if (userId && input.resetPassword) {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: input.password,
      email_confirm: true,
    });
    if (error) return { error: "Unable to update the employee password.", status: 400 as const };
    await admin.rpc("assign_employee_role", { p_company_id: input.companyId, p_user_id: userId });
    return { created: false };
  }

  if (!userId) {
    const created = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });

    if (created.data.user) {
      userId = created.data.user.id;
    } else {
      const already =
        created.error?.message?.toLowerCase().includes("already") ||
        created.error?.message?.toLowerCase().includes("registered");
      if (!already) return { error: "Unable to create the employee login.", status: 400 as const };

      const { data: profile } = await admin.from("users").select("id, company_id").eq("email", input.email).maybeSingle();
      if (profile?.company_id && profile.company_id !== input.companyId) {
        return { error: "That email already belongs to another company.", status: 409 as const };
      }
      if (profile?.id) {
        const { data: linked } = await admin.from("employees").select("id").eq("user_id", profile.id).maybeSingle();
        if (linked && linked.id !== input.employeeId) {
          return { error: "That login is already linked to another employee.", status: 409 as const };
        }
        userId = profile.id;
        await admin.auth.admin.updateUserById(userId, {
          password: input.password,
          email_confirm: true,
          user_metadata: { full_name: input.fullName },
        });
      } else {
        return { error: "That email already has an account. Use a different work email.", status: 409 as const };
      }
    }
  }

  if (!userId) return { error: "Unable to create the employee login.", status: 400 as const };

  await admin.from("users").upsert({
    id: userId,
    company_id: input.companyId,
    email: input.email,
    full_name: input.fullName,
    is_active: true,
  });

  const { error: linkError } = await admin
    .from("employees")
    .update({ user_id: userId, email: input.email })
    .eq("id", input.employeeId)
    .eq("company_id", input.companyId);
  if (linkError) {
    return { error: "Employee was saved, but the login could not be linked.", status: 400 as const };
  }

  const { error: roleError } = await admin.rpc("assign_employee_role", {
    p_company_id: input.companyId,
    p_user_id: userId,
  });
  if (roleError) {
    const { data: role } = await admin
      .from("roles")
      .select("id")
      .eq("company_id", input.companyId)
      .eq("slug", "employee")
      .maybeSingle();
    if (role?.id) {
      await admin.from("user_roles").upsert(
        {
          user_id: userId,
          role_id: role.id,
          company_id: input.companyId,
        },
        { onConflict: "user_id,role_id" },
      );
    }
  }

  await createNotification({
    companyId: input.companyId,
    userId,
    employeeId: input.employeeId,
    title: "Your Vivexa HR login is ready",
    body: "You can sign in to the employee app with the email and password set by your company.",
    type: "employee.account",
  });

  return { created: true };
}
