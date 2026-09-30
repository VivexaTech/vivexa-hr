import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
