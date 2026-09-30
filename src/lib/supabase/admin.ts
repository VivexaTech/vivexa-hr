import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

export function createAdminSupabaseClient() {
  if (!publicEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) {
    return null;
  }

  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
