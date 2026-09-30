import Link from "next/link";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-11 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
