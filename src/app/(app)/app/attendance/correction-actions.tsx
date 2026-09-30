"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CorrectionActions({ id }: { id: string }) {
  const router = useRouter();

  async function update(status: "approved" | "rejected") {
    await fetch("/api/attendance/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => update("approved")}>
        Approve
      </Button>
      <Button size="sm" variant="secondary" onClick={() => update("rejected")}>
        Reject
      </Button>
    </div>
  );
}
