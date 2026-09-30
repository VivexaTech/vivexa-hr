import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { brand } from "@/constants/brand";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How it Works" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
  {
    title: "Support",
    links: [{ href: "/support", label: "Support" }],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-6">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">{brand.description}</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-ink">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {brand.productName}</p>
          <p>{brand.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}
