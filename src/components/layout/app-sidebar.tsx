"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, History, Layers, Package } from "lucide-react";

import { classNames } from "@/lib/tremor/class-names";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/insights", label: "SKU Groups", icon: Layers },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/history", label: "History", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-dark-tremor-border bg-slate-950 xl:flex xl:flex-col">
      <div className="border-b border-dark-tremor-border px-6 py-5">
        <p className="text-tremor-label font-medium uppercase tracking-wider text-dark-tremor-content-subtle">
          Tremor Analytics
        </p>
        <p className="mt-1 text-tremor-title font-semibold text-dark-tremor-content-strong">
          Price Intelligence
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={classNames(
                "flex items-center gap-3 rounded-tremor-default px-3 py-2 text-tremor-default font-medium transition-colors",
                active
                  ? "bg-dark-tremor-background-subtle text-dark-tremor-brand"
                  : "text-dark-tremor-content hover:bg-dark-tremor-background-subtle hover:text-dark-tremor-content-strong",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-dark-tremor-border p-4">
        <p className="text-tremor-label text-dark-tremor-content-subtle">
          Workspace
        </p>
        <p className="mt-1 text-tremor-default leading-5 text-dark-tremor-content">
          Monitor competitor pricing, volatility, and arbitrage windows.
        </p>
      </div>
    </aside>
  );
}
