import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/request-user";

export type CompanyContext = {
  userId: string;
  email: string;
  companyId: string;
  permissions: Set<string>;
  employeeId: string | null;
  isSuperAdmin: boolean;
};

function collectPermissionKeys(permissionRows: unknown): Set<string> {
  const permissions = new Set<string>();
  for (const row of (permissionRows as Array<{ roles?: unknown }> | null) ?? []) {
    const roles = row.roles as
      | { role_permissions?: { permissions?: { key?: string } }[] }
      | { role_permissions?: { permissions?: { key?: string } }[] }[]
      | null;
    const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];
    for (const role of roleList) {
      for (const rp of role.role_permissions ?? []) {
        if (rp.permissions?.key) permissions.add(rp.permissions.key);
      }
    }
  }
  return permissions;
}

export async function requireCompanyContext(request: Request): Promise<
  { ok: true; ctx: CompanyContext } | { ok: false; status: number; error: string }
> {
  const user = await getRequestUser(request);
  if (!user) return { ok: false, status: 401, error: "Authentication required." };

  const admin = createAdminSupabaseClient();
  if (!admin) return { ok: false, status: 503, error: "Server configuration is incomplete." };

  const { data: profile } = await admin
    .from("users")
    .select("company_id, is_super_admin, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.company_id) {
    return { ok: false, status: 403, error: "No company is linked to this account." };
  }

  const { data: permissionRows } = await admin
    .from("user_roles")
    .select("roles(role_permissions(permissions(key)))")
    .eq("user_id", user.id)
    .eq("company_id", profile.company_id);

  const { data: employee } = await admin
    .from("employees")
    .select("id")
    .eq("user_id", user.id)
    .eq("company_id", profile.company_id)
    .is("deleted_at", null)
    .maybeSingle();

  return {
    ok: true,
    ctx: {
      userId: user.id,
      email: user.email ?? profile.email ?? "",
      companyId: profile.company_id,
      permissions: collectPermissionKeys(permissionRows),
      employeeId: employee?.id ?? null,
      isSuperAdmin: Boolean(profile.is_super_admin),
    },
  };
}

export function hasPerm(ctx: CompanyContext, key: string) {
  return ctx.isSuperAdmin || ctx.permissions.has(key);
}

export async function notifyPermissionHolders(input: {
  companyId: string;
  permission: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
}) {
  const admin = createAdminSupabaseClient();
  if (!admin) return;

  const { data: holders } = await admin
    .from("user_roles")
    .select("user_id, roles(role_permissions(permissions(key)))")
    .eq("company_id", input.companyId);

  const userIds = new Set<string>();
  for (const row of holders ?? []) {
    const keys = collectPermissionKeys([row]);
    if (keys.has(input.permission)) userIds.add(row.user_id);
  }

  if (!userIds.size) return;
  await admin.from("notifications").insert(
    [...userIds].map((userId) => ({
      company_id: input.companyId,
      user_id: userId,
      title: input.title,
      body: input.body,
      type: input.type,
      data: input.data ?? {},
    })),
  );
}

export function inclusiveDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function eachDate(startDate: string, endDate: string) {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}
