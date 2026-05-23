import Link from "next/link";
import { Package, Sparkles } from "lucide-react";

import { AppNavLinks } from "@/components/layout/app-nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProductSwitcher } from "@/components/layout/product-switcher";
import type { ProductCatalog } from "@/lib/products/selection";

type AppShellProps = {
  catalog: ProductCatalog;
  children: React.ReactNode;
};

export function AppShell({ catalog, children }: AppShellProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col xl:flex-row">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#0b1120_48%,#020617_100%)]"
      />

      <aside className="relative hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/70 backdrop-blur-xl xl:flex xl:flex-col">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Intelligence
              </p>
              <p className="text-lg font-bold text-white">Price Engine</p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 p-4">
          <ProductSwitcher
            products={catalog.products}
            selectedProduct={catalog.selectedProduct}
          />
        </div>

        <AppNavLinks />

        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
          >
            <Package className="size-4" />
            Manage listings
          </Link>
        </div>
      </aside>

      <div className="relative flex min-h-full flex-1 flex-col">
        <header className="border-b border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur-xl xl:hidden">
          <ProductSwitcher
            products={catalog.products}
            selectedProduct={catalog.selectedProduct}
            compact
          />
        </header>
        <MobileNav />
        <main className="relative flex min-h-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
