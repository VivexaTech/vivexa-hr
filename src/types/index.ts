export type CompanyStatus = "onboarding" | "active" | "suspended" | "cancelled";
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern" | "consultant";
export type EmploymentStatus = "active" | "inactive" | "terminated" | "on_notice";
export type AttendanceStatus =
  | "present"
  | "late"
  | "half_day"
  | "absent"
  | "leave"
  | "holiday"
  | "week_off"
  | "wfh"
  | "on_duty";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  companyId: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
  employeeId: string | null;
};

export type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  status: CompanyStatus;
  onboarding_step: number;
};

export type Employee = {
  id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  joining_date: string | null;
  department_id: string | null;
  designation_id: string | null;
  branch_id: string | null;
};

export type Paginated<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
};
