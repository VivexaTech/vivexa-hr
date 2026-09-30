import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { siteNav } from "@/constants/brand";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Vivexa HR home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex" aria-label="Primary">
          {siteNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-medium text-ink sm:inline">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm">Start Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
