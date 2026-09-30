import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentUser } from "@/lib/services/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-line bg-white p-8">
          <h1 className="font-display text-2xl">Connect Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Copy web/.env.example to web/.env.local, add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
            SUPABASE_SERVICE_ROLE_KEY, then run the SQL migrations in /supabase/migrations.
          </p>
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const { data: company } = user.companyId
    ? await supabase!.from("companies").select("name, status, onboarding_step").eq("id", user.companyId).single()
    : { data: null };

  const pathname = (await headers()).get("x-pathname") || "";
  if (
    company?.status === "onboarding" &&
    (company.onboarding_step ?? 0) < 6 &&
    !pathname.startsWith("/app/onboarding")
  ) {
    redirect("/app/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar permissions={user.permissions} isSuperAdmin={user.isSuperAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user.fullName || user.email} companyName={company?.name} />
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
