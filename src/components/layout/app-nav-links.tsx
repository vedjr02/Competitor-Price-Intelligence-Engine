"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "@/components/layout/nav-config";
import { classNames } from "@/lib/tremor/class-names";

export function AppNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {appNavItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={classNames(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
              active
                ? "bg-blue-500/15 text-blue-200 shadow-inner shadow-blue-500/10"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
