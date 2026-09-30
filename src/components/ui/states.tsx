import { AlertCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <h3 className="mt-4 font-display text-lg text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Unable to load this page", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-danger" />
      <h3 className="mt-4 font-display text-lg text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        {description || "Please refresh the page or try again in a few minutes."}
      </p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200/80", className)} />;
}

export function Alert({
  tone = "success",
  children,
}: {
  tone?: "success" | "error" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
  };
  return <div className={cn("rounded-lg border px-4 py-3 text-sm", styles[tone])}>{children}</div>;
}
