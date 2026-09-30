import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className={cn("min-w-full text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("border-t border-line px-4 py-3 text-ink", className)}>
      {children}
    </td>
  );
}

export function Pagination({
  page,
  pageSize,
  count,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  count: number;
  onPageChange?: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-muted">
      <p>
        Page {page} of {pages} · {count} records
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange?.(page + 1)}
          className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
