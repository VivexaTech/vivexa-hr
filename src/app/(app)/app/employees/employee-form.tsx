"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { employeeSaveSchema } from "@/lib/validations/hr";

type Option = { id: string; name: string };

const selectClass = "h-11 w-full rounded-lg border border-line px-3 text-sm";

export function EmployeeForm({
  companyId,
  departments,
  designations,
  branches,
  managers,
  initial,
}: {
  companyId: string;
  departments: Option[];
  designations: Option[];
  branches: Option[];
  managers: Option[];
  initial?: Partial<{
    id: string;
    full_name: string;
    employee_code: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    joining_date: string;
    employment_type: string;
    employment_status: string;
    department_id: string;
    designation_id: string;
    branch_id: string;
    reporting_manager_id: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    photo_url: string;
    user_id: string | null;
  }>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [createAccount, setCreateAccount] = useState(!initial?.user_id);
  const [resetPassword, setResetPassword] = useState(false);
  const hasLogin = Boolean(initial?.user_id);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = Object.fromEntries(new FormData(event.currentTarget).entries());
        const wantsAccount = form.createAccount === "on" || form.resetPassword === "on";
        const parsed = employeeSaveSchema.safeParse({
          id: initial?.id,
          fullName: form.fullName,
          employeeCode: form.employeeCode,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender || undefined,
          joiningDate: form.joiningDate,
          employmentType: form.employmentType,
          employmentStatus: form.employmentStatus,
          departmentId: form.departmentId || undefined,
          designationId: form.designationId || undefined,
          branchId: form.branchId || undefined,
          reportingManagerId: form.reportingManagerId || undefined,
          address: form.address,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          basicSalary: form.basicSalary,
          photoUrl: form.photoUrl,
          createAccount: form.createAccount === "on",
          resetPassword: form.resetPassword === "on",
          password: form.password,
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || "Check the employee details.");
          return;
        }
        setPending(true);
        setError("");
        setMessage("");
        const response = await fetch("/api/employees/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const payload = (await response.json()) as { error?: string; accountCreated?: boolean };
        setPending(false);
        if (!response.ok) {
          setError(payload.error || "Unable to save the employee.");
          return;
        }
        if (wantsAccount && payload.accountCreated) {
          setMessage("Employee saved. They can sign in to the Android app with this email and password.");
        }
        router.push("/app/employees");
        router.refresh();
      }}
    >
      {error ? (
        <div className="md:col-span-2">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="md:col-span-2">
          <Alert>{message}</Alert>
        </div>
      ) : null}
      <div className="md:col-span-2">
        <h3 className="font-display text-lg">Personal</h3>
      </div>
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={initial?.full_name} required />
      </div>
      <div>
        <Label htmlFor="photoUrl">Profile photo URL</Label>
        <Input id="photoUrl" name="photoUrl" defaultValue={initial?.photo_url ?? ""} placeholder="Cloudinary or S3 URL" />
      </div>
      <div>
        <Label htmlFor="dateOfBirth">Date of birth</Label>
        <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={initial?.date_of_birth ?? ""} />
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <select id="gender" name="gender" defaultValue={initial?.gender || ""} className={selectClass}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={initial?.address ?? ""} />
      </div>
      <div>
        <Label htmlFor="emergencyContactName">Emergency contact</Label>
        <Input id="emergencyContactName" name="emergencyContactName" defaultValue={initial?.emergency_contact_name ?? ""} />
      </div>
      <div>
        <Label htmlFor="emergencyContactPhone">Emergency phone</Label>
        <Input id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={initial?.emergency_contact_phone ?? ""} />
      </div>
      <div className="md:col-span-2 mt-2">
        <h3 className="font-display text-lg">Employment</h3>
      </div>
      <div>
        <Label htmlFor="employeeCode">Employee ID</Label>
        <Input id="employeeCode" name="employeeCode" defaultValue={initial?.employee_code} required />
      </div>
      <div>
        <Label htmlFor="joiningDate">Joining date</Label>
        <Input id="joiningDate" name="joiningDate" type="date" defaultValue={initial?.joining_date ?? ""} />
      </div>
      <div>
        <Label htmlFor="employmentType">Employment type</Label>
        <select id="employmentType" name="employmentType" defaultValue={initial?.employment_type || "full_time"} className={selectClass}>
          <option value="full_time">Full time</option>
          <option value="part_time">Part time</option>
          <option value="contract">Contract</option>
          <option value="intern">Intern</option>
          <option value="consultant">Consultant</option>
        </select>
      </div>
      <div>
        <Label htmlFor="employmentStatus">Status</Label>
        <select id="employmentStatus" name="employmentStatus" defaultValue={initial?.employment_status || "active"} className={selectClass}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_notice">On notice</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
      <div>
        <Label htmlFor="departmentId">Department</Label>
        <select id="departmentId" name="departmentId" defaultValue={initial?.department_id || ""} className={selectClass}>
          <option value="">Select</option>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="designationId">Designation</Label>
        <select id="designationId" name="designationId" defaultValue={initial?.designation_id || ""} className={selectClass}>
          <option value="">Select</option>
          {designations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="branchId">Branch</Label>
        <select id="branchId" name="branchId" defaultValue={initial?.branch_id || ""} className={selectClass}>
          <option value="">Select</option>
          {branches.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="reportingManagerId">Reporting manager</Label>
        <select id="reportingManagerId" name="reportingManagerId" defaultValue={initial?.reporting_manager_id || ""} className={selectClass}>
          <option value="">Select</option>
          {managers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="basicSalary">Basic salary</Label>
        <Input id="basicSalary" name="basicSalary" type="number" min="0" step="0.01" />
      </div>
      <div className="md:col-span-2 mt-2 space-y-3 rounded-2xl border border-line bg-paper p-4">
        <h3 className="font-display text-lg">Employee app login</h3>
        {hasLogin ? (
          <p className="text-sm text-muted">This person already has a Vivexa HR login for the Android app.</p>
        ) : (
          <p className="text-sm text-muted">
            Create an account so they can check in, apply for leave, and view payslips in the employee app.
          </p>
        )}
        {!hasLogin ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="createAccount"
              checked={createAccount}
              onChange={(event) => setCreateAccount(event.target.checked)}
            />
            Create employee login
          </label>
        ) : (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="resetPassword"
              checked={resetPassword}
              onChange={(event) => setResetPassword(event.target.checked)}
            />
            Set a new password
          </label>
        )}
        {createAccount || resetPassword ? (
          <div>
            <Label htmlFor="password">{hasLogin ? "New password" : "App password"}</Label>
            <Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
            <p className="mt-1 text-xs text-muted">Share this email and password with the employee. They use it on Android and at Login.</p>
          </div>
        ) : null}
      </div>
      <div className="md:col-span-2 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save employee"}
        </Button>
        {initial?.id ? (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!supabase || !initial.id) return;
              await supabase
                .from("employees")
                .update({ employment_status: "inactive" })
                .eq("id", initial.id)
                .eq("company_id", companyId);
              router.push("/app/employees");
              router.refresh();
            }}
          >
            Deactivate
          </Button>
        ) : null}
      </div>
    </form>
  );
}
