import { ExternalLink } from "lucide-react";

import { PriceTrendChart } from "@/components/dashboard/price-trend-chart";
import { ScrapeButton } from "@/components/products/scrape-button";
import { ExportCsvButton } from "@/components/export/export-csv-button";
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

  return (
    <header className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200">
              Active overview
            </span>
            <span
              className={
                data.isLiveData
                  ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300"
                  : "rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300"
              }
            >
              {data.isLiveData ? "Live data" : "Awaiting connection"}
            </span>
          </div>

          {product ? (
            <div className="space-y-2">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-sm text-slate-400">
                {product.competitor}
                {product.sku ? ` · SKU ${product.sku}` : " · SKU pending"}
                {" · "}
                Last capture {formatDate(latest?.latestScrapedAt ?? null)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                No product selected
              </h1>
              <p className="text-sm text-slate-400">
                Add a competitor listing to start tracking price intelligence.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {product ? (
            <>
              <ScrapeButton
                productId={product.id}
                label="Refresh price"
                variant="default"
                size="default"
              />
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                View listing
                <ExternalLink className="size-4" />
              </a>
            </>
          ) : null}
          <ExportCsvButton />
        </div>
      </div>
    </header>
  );
}

export function DashboardHeroStats({ data }: DashboardHeaderProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.progressMetrics.map((metric) => (
        <GlassPanel key={metric.name} className="p-5" glow>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {metric.name}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {metric.stat}
          </p>
          <p className="mt-2 text-xs text-slate-500">{metric.limit}</p>
        </GlassPanel>
      ))}
    </section>
  );
}

export function DashboardTrendSection({ data }: DashboardHeaderProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Price history</h2>
          <p className="mt-1 text-sm text-slate-400">
            30-day capture trend for the selected listing only.
          </p>
        </div>
      </div>
      <PriceTrendChart data={data.trends} />
    </GlassPanel>
  );
}
