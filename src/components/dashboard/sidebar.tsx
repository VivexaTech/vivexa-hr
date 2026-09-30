"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { appNav, superAdminNav } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({
  permissions,
  isSuperAdmin,
}: {
  permissions: string[];
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const items = appNav.filter((item) => !item.permission || permissions.includes(item.permission) || isSuperAdmin);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:block">
      <div className="flex h-16 items-center px-5">
        <Link href="/app/dashboard">
          <Logo />
        </Link>
      </div>
      <nav className="space-y-1 px-3 pb-8" aria-label="HR">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                active ? "bg-brand-50 font-medium text-brand" : "text-muted hover:bg-paper hover:text-ink",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {isSuperAdmin ? (
          <div className="pt-6">
            <p className="px-3 pb-2 text-xs uppercase tracking-wide text-muted">Platform</p>
            {superAdminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-paper hover:text-ink"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
