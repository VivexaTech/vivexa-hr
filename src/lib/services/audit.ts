import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function writeAudit(input: {
  companyId?: string | null;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  const admin = createAdminSupabaseClient();
  if (!admin) return;

  await admin.from("audit_logs").insert({
    company_id: input.companyId,
    actor_id: input.actorId,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    old_value: input.oldValue ?? null,
    new_value: input.newValue ?? null,
  });
}
