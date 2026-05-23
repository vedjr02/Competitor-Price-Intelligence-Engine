"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "@/components/layout/nav-config";
import { classNames } from "@/lib/tremor/class-names";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0a0f0d]/90 px-2 py-2 backdrop-blur-xl xl:hidden">
      {appNavItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={classNames(
              "flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold",
              active
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300",
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
