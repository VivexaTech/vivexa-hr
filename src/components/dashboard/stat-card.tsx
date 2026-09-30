import { Card } from "@/components/ui/card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </Card>
  );
}
