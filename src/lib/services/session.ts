import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, company_id, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { data: permissionRows } = await supabase
    .from("user_roles")
    .select("roles(role_permissions(permissions(key)))")
    .eq("user_id", user.id);

  const permissions = new Set<string>();
  for (const row of permissionRows ?? []) {
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

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    fullName: profile?.full_name ?? null,
    companyId: profile?.company_id ?? null,
    isSuperAdmin: Boolean(profile?.is_super_admin),
    permissions: [...permissions],
    employeeId: employee?.id ?? null,
  };
}

export function hasPermission(user: CurrentUser | null, key?: string) {
  if (!user) return false;
  if (!key) return true;
  if (user.isSuperAdmin) return true;
  return user.permissions.includes(key);
}
