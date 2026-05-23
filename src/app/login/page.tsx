import { Sparkles } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { GlassPanel } from "@/components/ui/glass-panel";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next ?? "/dashboard";

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[#060908] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_50%)]"
      />

      <GlassPanel className="relative w-full max-w-md p-8" glow>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#0a0f0d]">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">PriceSense</h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500/80">
              Precision Analytics
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-400">
          Sign in to track competitor prices, configure alerts, and receive
          automated email signals when thresholds are hit.
        </p>

        <div className="mt-8">
          <GoogleSignInButton nextPath={nextPath} />
        </div>

        {params.error ? (
          <p className="mt-4 text-sm text-rose-400">
            Sign-in failed. Please try again.
          </p>
        ) : null}
      </GlassPanel>
    </div>
  );
}
