import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <MarketingHeader />
      <main className="mx-auto flex max-w-xl flex-1 flex-col justify-center px-4 py-24 text-center">
        <p className="text-sm font-medium text-brand">404</p>
        <h1 className="mt-3 font-display text-4xl text-ink">This page is not available</h1>
        <p className="mt-4 text-sm leading-6 text-muted">The link may be incorrect, or the page may have moved.</p>
        <Link href="/" className="mt-8 text-sm font-medium text-brand">
          Back to homepage
        </Link>
      </main>
      <MarketingFooter />
    </div>
  );
}
