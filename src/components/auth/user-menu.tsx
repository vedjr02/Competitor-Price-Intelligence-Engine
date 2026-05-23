"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type UserMenuProps = {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export function UserMenu({ email, fullName, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const label = fullName ?? email.split("@")[0];

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full"
        />
      ) : (
        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">
          {label.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{label}</p>
        <p className="truncate text-xs text-slate-500">{email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
