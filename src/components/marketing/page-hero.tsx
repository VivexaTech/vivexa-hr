import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  crumbs: { name: string; href: string }[];
}) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {index > 0 ? <span>/</span> : null}
                <Link href={crumb.href} className={index === crumbs.length - 1 ? "text-ink" : "hover:text-ink"}>
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow ? <p className="mt-6 text-sm font-medium text-brand">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
