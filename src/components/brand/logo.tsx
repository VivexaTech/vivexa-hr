import { brand } from "@/constants/brand";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
        V
      </span>
      {compact ? null : <span className="font-display text-lg tracking-tight text-ink">{brand.productName}</span>}
    </span>
  );
}
