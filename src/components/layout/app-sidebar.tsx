"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Radar,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/products", label: "Products", icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur xl:flex xl:flex-col">
      <div className="border-b border-border/60 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Radar className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Price Intelligence
            </p>
            <p className="text-xs text-muted-foreground">Arbitrage Engine</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="rounded-xl border border-border/60 bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="size-4 text-primary" />
            Market Pulse
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Track competitor moves, volatility spikes, and arbitrage windows in
            one workspace.
          </p>
        </div>
      </div>
    </aside>
  );
}
