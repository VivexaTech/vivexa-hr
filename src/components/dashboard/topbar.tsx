"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function Topbar({ name, companyName }: { name: string; companyName?: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
      <div>
        <p className="text-sm font-medium text-ink">{companyName || "Vivexa HR"}</p>
        <p className="text-xs text-muted">{name}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={signOut}>
        Sign out
      </Button>
    </header>
  );
}
