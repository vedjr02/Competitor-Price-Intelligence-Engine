"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Package } from "lucide-react";

import { classNames } from "@/lib/tremor/class-names";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/products", label: "Products", icon: Package },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-dark-tremor-border bg-slate-950 px-4 py-3 xl:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={classNames(
              "flex flex-1 items-center justify-center gap-2 rounded-tremor-default px-3 py-2 text-tremor-default font-medium",
              active
                ? "bg-dark-tremor-background-subtle text-dark-tremor-brand"
                : "text-dark-tremor-content hover:bg-dark-tremor-background-subtle",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
