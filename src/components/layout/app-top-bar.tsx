import Link from "next/link";
import { Bell, Search } from "lucide-react";

import type { ProductOption } from "@/lib/products/selection";

type AppTopBarProps = {
  product: ProductOption | null;
};

export function AppTopBar({ product }: AppTopBarProps) {
  return (
    <div className="sticky top-0 z-20 hidden border-b border-white/[0.06] bg-[#0a0f0d]/80 px-6 py-3 backdrop-blur-xl xl:block">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="transition hover:text-emerald-400">
            Market
          </Link>
          {product ? (
            <>
              <span>/</span>
              <span className="truncate text-slate-400">{product.competitor}</span>
              <span>/</span>
              <span className="truncate font-bold text-white">{product.name}</span>
            </>
          ) : (
            <>
              <span>/</span>
              <span className="text-slate-400">Select a product</span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search tracked listings…"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              readOnly
              aria-label="Search tracked listings"
            />
          </div>
          <Link
            href="/alerts"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-400"
            aria-label="Signals and alerts"
          >
            <Bell className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
