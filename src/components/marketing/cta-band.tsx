import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/constants/brand";

export function CtaBand() {
  return (
    <section className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Ready to simplify HR?</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
            Start with the Free plan. {brand.freePlanLabel}. Upgrade later when your team grows.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/register">
            <Button className="bg-white text-brand hover:bg-paper">Start Free</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Contact us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
