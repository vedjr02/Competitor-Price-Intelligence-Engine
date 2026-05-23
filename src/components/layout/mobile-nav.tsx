"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Package } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/products", label: "Products", icon: Package },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur xl:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent",
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
