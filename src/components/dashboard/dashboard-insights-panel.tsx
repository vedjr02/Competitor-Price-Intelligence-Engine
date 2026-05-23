import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bell, Sparkles } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";

type DashboardInsightsPanelProps = {
  data: DashboardData;
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(value);
}

export function DashboardInsightsPanel({ data }: DashboardInsightsPanelProps) {
  const product = data.product;
  const latest = data.trackedProducts[0];
  const volatility = data.volatilities[0]?.volatilityPercent ?? 0;
  const currency = product?.currency ?? "EUR";

  const sentimentTags = [
    latest?.latestPrice != null ? "Tracking active" : "Awaiting capture",
    volatility > 8 ? "Price volatile" : "Price stable",
    data.snapshotCount >= 5 ? "Trend forming" : "Early data",
  ];

  const insights = [
    latest?.latestPrice != null
      ? `Latest capture: ${formatCurrency(latest.latestPrice, currency)} at ${product?.competitor ?? "store"}.`
      : "Run a refresh to capture the first price snapshot.",
    data.priceStats.lowest != null
      ? `Lowest recorded: ${formatCurrency(data.priceStats.lowest, currency)}${data.priceStats.lowestDate ? ` on ${data.priceStats.lowestDate}` : ""}.`
      : null,
    latest?.priceChangePercent != null
      ? `Recent move: ${latest.priceChangePercent >= 0 ? "+" : ""}${latest.priceChangePercent.toFixed(1)}% vs prior snapshot.`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <GlassPanel className="p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live insights</h3>
        </div>
        <ul className="mt-4 space-y-3">
          {insights.length === 0 ? (
            <li className="text-sm text-slate-500">Insights appear after price captures.</li>
          ) : (
            insights.map((insight) => (
              <li
                key={insight}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm leading-6 text-slate-300"
              >
                {insight}
              </li>
            ))
          )}
        </ul>
      </GlassPanel>

      <GlassPanel className="p-5">
        <h3 className="text-sm font-bold text-white">Market sentiment</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {sentimentTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <h3 className="text-sm font-bold text-white">Volatility</h3>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-bold text-white">
            {volatility.toFixed(1)}%
          </span>
          <span className="pb-1 text-xs text-slate-500">30d CV</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
            style={{ width: `${Math.min(volatility * 6, 100)}%` }}
          />
        </div>
      </GlassPanel>

      {product ? (
        <Link
          href="/alerts"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-[#022c22] transition hover:bg-emerald-400"
        >
          <Bell className="size-4" />
          Set price alert
        </Link>
      ) : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string;
  sublabel: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <GlassPanel className="p-5" glow>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {value}
        </p>
        {trend === "up" ? (
          <ArrowUpRight className="size-5 text-emerald-400" />
        ) : trend === "down" ? (
          <ArrowDownRight className="size-5 text-rose-400" />
        ) : null}
      </div>
      <p className="mt-2 text-xs text-slate-500">{sublabel}</p>
    </GlassPanel>
  );
}
