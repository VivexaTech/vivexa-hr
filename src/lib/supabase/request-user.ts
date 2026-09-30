import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getRequestUser(request: Request) {
  const server = await createServerSupabaseClient();
  if (server) {
    const { data } = await server.auth.getUser();
    if (data.user) return data.user;
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ") || !publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return null;
  }

  const client = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data } = await client.auth.getUser();
  return data.user;
}
