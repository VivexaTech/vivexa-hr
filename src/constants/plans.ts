export type PlanFeature = {
  key: string;
  label: string;
  enabled: boolean;
};

export type PricingPlan = {
  slug: string;
  name: string;
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  companyLimit: number;
  employeeLimit: number;
  storageMb: number;
  supportLevel: string;
  highlighted?: boolean;
  features: PlanFeature[];
};

export const fallbackPlans: PricingPlan[] = [
  {
    slug: "free",
    name: "Free",
    description: "For one company getting started with core HR.",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "INR",
    companyLimit: 1,
    employeeLimit: 5,
    storageMb: 256,
    supportLevel: "community",
    features: [
      { key: "employees", label: "Employee management", enabled: true },
      { key: "attendance_basic", label: "Basic attendance", enabled: true },
      { key: "leave", label: "Leave management", enabled: true },
      { key: "profiles", label: "Employee profiles", enabled: true },
      { key: "notices_basic", label: "Basic notices", enabled: true },
      { key: "dashboard_basic", label: "Basic dashboard", enabled: true },
    ],
  },
  {
    slug: "startup",
    name: "Startup",
    description: "For growing teams that need more employees and attendance controls.",
    priceMonthly: null,
    priceYearly: null,
    currency: "INR",
    companyLimit: 1,
    employeeLimit: 25,
    storageMb: 2048,
    supportLevel: "email",
    highlighted: true,
    features: [
      { key: "employees", label: "Employee management", enabled: true },
      { key: "attendance_smart", label: "Smart attendance", enabled: true },
      { key: "geofencing", label: "Geofenced attendance", enabled: true },
      { key: "shifts", label: "Shift management", enabled: true },
      { key: "leave", label: "Leave management", enabled: true },
    ],
  },
  {
    slug: "business",
    name: "Business",
    description: "For companies that need payroll, reports, and multi-branch operations.",
    priceMonthly: null,
    priceYearly: null,
    currency: "INR",
    companyLimit: 3,
    employeeLimit: 100,
    storageMb: 10240,
    supportLevel: "priority",
    features: [
      { key: "payroll", label: "Payroll and payslips", enabled: true },
      { key: "documents", label: "Document management", enabled: true },
      { key: "reports_advanced", label: "Reports and exports", enabled: true },
      { key: "multi_branch", label: "Multiple branches", enabled: true },
      { key: "attendance_smart", label: "Smart attendance", enabled: true },
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    description: "For larger organizations with custom limits and dedicated support.",
    priceMonthly: null,
    priceYearly: null,
    currency: "INR",
    companyLimit: 10,
    employeeLimit: 1000,
    storageMb: 51200,
    supportLevel: "dedicated",
    features: [
      { key: "custom_roles", label: "Custom roles", enabled: true },
      { key: "priority_support", label: "Dedicated support", enabled: true },
      { key: "payroll", label: "Payroll and payslips", enabled: true },
      { key: "reports_advanced", label: "Reports and exports", enabled: true },
      { key: "multi_branch", label: "Multiple branches", enabled: true },
    ],
  },
];

export function formatPlanPrice(plan: PricingPlan) {
  if (plan.priceMonthly === 0) return "Free";
  if (plan.priceMonthly == null) return "Contact us";
  return `₹${plan.priceMonthly.toLocaleString("en-IN")}/mo`;
}
