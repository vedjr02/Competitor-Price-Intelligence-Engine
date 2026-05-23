import Link from "next/link";
import { Bell, ExternalLink, Package } from "lucide-react";

import {
  DashboardInsightsPanel,
  MetricCard,
} from "@/components/dashboard/dashboard-insights-panel";
import { PriceTrendChart } from "@/components/dashboard/price-trend-chart";
import { ScrapeButton } from "@/components/products/scrape-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";

type DashboardHeaderProps = {
  data: DashboardData;
};

function formatDate(value: string | null) {
  if (!value) return "Never scraped";
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  const product = data.product;
  const latest = data.trackedProducts[0];
  const change = latest?.priceChangePercent;

  return (
    <GlassPanel className="p-6" glow>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="hidden size-20 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 sm:flex">
            <Package className="size-8 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Tracking
              </span>
              {latest?.latestPrice != null ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  In stock signal
                </span>
              ) : null}
              <span
                className={
                  data.isLiveData
                    ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400"
                    : "rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300"
                }
              >
                {data.isLiveData ? "Live sync" : "Offline"}
              </span>
            </div>

            {product ? (
              <>
                <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {product.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {product.competitor}
                  {product.sku ? ` · ${product.sku}` : ""}
                  {" · "}
                  Last capture {formatDate(latest?.latestScrapedAt ?? null)}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  No product selected
                </h1>
                <p className="text-sm text-slate-500">
                  Paste a URL on Products to start precision tracking.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product ? (
            <>
              <ScrapeButton
                productId={product.id}
                label="Refresh price"
                variant="default"
                size="default"
              />
              <Link
                href="/alerts"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-[#022c22] transition hover:bg-emerald-400"
              >
                <Bell className="size-4" />
                Set alert
              </Link>
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-emerald-500/30 hover:text-white"
              >
                View listing
                <ExternalLink className="size-4" />
              </a>
            </>
          ) : null}
        </div>
      </div>
    </GlassPanel>
  );
}

export function DashboardHeroStats({ data }: DashboardHeaderProps) {
  const currency = data.product?.currency ?? "EUR";
  const formatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  });
  const change = data.trackedProducts[0]?.priceChangePercent;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Average price"
        value={
          data.priceStats.average != null
            ? formatter.format(data.priceStats.average)
            : "—"
        }
        sublabel="30-day mean"
      />
      <MetricCard
        label="Lowest recorded"
        value={
          data.priceStats.lowest != null
            ? formatter.format(data.priceStats.lowest)
            : "—"
        }
        sublabel={data.priceStats.lowestDate ?? "30-day floor"}
      />
      <MetricCard
        label="Latest price"
        value={
          data.trackedProducts[0]?.latestPrice != null
            ? formatter.format(data.trackedProducts[0].latestPrice!)
            : "—"
        }
        sublabel={
          change != null
            ? `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs prior`
            : "Live capture"
        }
        trend={
          change == null ? "neutral" : change >= 0 ? "up" : "down"
        }
      />
      <MetricCard
        label="Volatility"
        value={`${data.volatilities[0]?.volatilityPercent.toFixed(1) ?? "0.0"}%`}
        sublabel={`${data.snapshotCount} snapshots · 30d CV`}
      />
    </section>
  );
}

export function DashboardTrendSection({ data }: DashboardHeaderProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-white">Price history</h2>
        <p className="mt-1 text-sm text-slate-500">
          Precision capture trend for the selected listing.
        </p>
      </div>
      <PriceTrendChart
        data={data.trends}
        currency={data.product?.currency ?? "EUR"}
      />
    </GlassPanel>
  );
}

export { DashboardInsightsPanel };
