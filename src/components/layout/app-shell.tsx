"use client";

import Link from "next/link";
import { Package, Sparkles } from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { AppNavLinks } from "@/components/layout/app-nav-links";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProductSwitcher } from "@/components/layout/product-switcher";
import type { UserProfile } from "@/lib/auth/get-profile";
import type { ProductCatalog } from "@/lib/products/selection";

type AppShellProps = {
  catalog: ProductCatalog;
  profile: UserProfile | null;
  children: React.ReactNode;
};

export function AppShell({ catalog, profile, children }: AppShellProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col xl:flex-row">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[#060908] bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.12),transparent_42%),radial-gradient(ellipse_at_80%_0%,rgba(52,211,153,0.06),transparent_35%)]"
      />

      <aside className="relative hidden w-[17.5rem] shrink-0 border-r border-white/[0.06] bg-[#0a0f0d]/90 backdrop-blur-xl xl:flex xl:flex-col">
        <div className="border-b border-white/[0.06] px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#0a0f0d] shadow-lg shadow-emerald-500/25">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                PriceSense
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500/80">
                Precision Analytics
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/[0.06] p-4">
          <ProductSwitcher
            products={catalog.products}
            selectedProduct={catalog.selectedProduct}
          />
        </div>

        <AppNavLinks />

        <div className="mt-auto space-y-3 border-t border-white/[0.06] p-4">
          {profile ? (
            <UserMenu
              email={profile.email}
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
            />
          ) : null}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Sync integrity
            </p>
            <p className="mt-1 text-sm font-bold text-white">Automated tracking</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Cron captures once daily on Vercel (free plan).
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white"
          >
            <Package className="size-4" />
            Manage listings
          </Link>
        </div>
      </aside>

      <div className="relative flex min-h-full flex-1 flex-col">
        <header className="border-b border-white/[0.06] bg-[#0a0f0d]/80 px-4 py-4 backdrop-blur-xl xl:hidden">
          <ProductSwitcher
            products={catalog.products}
            selectedProduct={catalog.selectedProduct}
            compact
          />
        </header>
        <MobileNav />
        <AppTopBar product={catalog.selectedProduct} />
        <main className="relative flex min-h-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
