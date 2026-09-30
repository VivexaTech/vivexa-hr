import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  Home,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Settings,
  Sun,
  Timer,
  Users,
  Wallet,
  BarChart3,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
};

export const appNav: AppNavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/employees", label: "Employees", icon: Users, permission: "employees.view" },
  { href: "/app/attendance", label: "Attendance", icon: ClipboardList, permission: "attendance.view" },
  { href: "/app/leaves", label: "Leaves", icon: CalendarDays, permission: "leave.view" },
  { href: "/app/wfh", label: "Work from home", icon: Home, permission: "leave.view" },
  { href: "/app/departments", label: "Departments", icon: Briefcase, permission: "departments.manage" },
  { href: "/app/branches", label: "Branches", icon: MapPin, permission: "branches.manage" },
  { href: "/app/designations", label: "Designations", icon: Building2, permission: "departments.manage" },
  { href: "/app/shifts", label: "Shifts", icon: Timer, permission: "attendance.manage" },
  { href: "/app/holidays", label: "Holidays", icon: Sun, permission: "holidays.manage" },
  { href: "/app/payroll", label: "Payroll", icon: Wallet, permission: "payroll.view" },
  { href: "/app/documents", label: "Documents", icon: FolderOpen, permission: "documents.view" },
  { href: "/app/notices", label: "Notices", icon: Megaphone, permission: "notices.manage" },
  { href: "/app/reports", label: "Reports", icon: BarChart3, permission: "reports.view" },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
];

export const superAdminNav: AppNavItem[] = [
  { href: "/app/super-admin", label: "Overview", icon: LayoutDashboard },
  { href: "/app/super-admin/companies", label: "Companies", icon: Building2 },
  { href: "/app/super-admin/plans", label: "Plans", icon: FileText },
];
