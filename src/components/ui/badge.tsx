import { cn } from "@/lib/utils";

const tones = {
  default: "bg-paper text-ink",
  brand: "bg-brand-50 text-brand",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-800",
} as const;

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
