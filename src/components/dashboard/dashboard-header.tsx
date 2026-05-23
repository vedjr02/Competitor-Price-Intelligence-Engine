import { ScrapeButton } from "@/components/products/scrape-button";

type DashboardHeaderProps = {
  productCount: number;
  snapshotCount: number;
  isLiveData: boolean;
};

export function DashboardHeader({
  productCount,
  snapshotCount,
  isLiveData,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-dark-tremor-border pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-tremor-small bg-dark-tremor-background-subtle px-2 py-1 text-tremor-label font-medium text-dark-tremor-content-emphasis">
            Market Intelligence
          </span>
          <span
            className={
              isLiveData
                ? "rounded-tremor-small bg-emerald-400/10 px-2 py-1 text-tremor-label font-medium text-emerald-400"
                : "rounded-tremor-small bg-amber-400/10 px-2 py-1 text-tremor-label font-medium text-amber-400"
            }
          >
            {isLiveData ? "Live data" : "Awaiting connection"}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-dark-tremor-content-strong sm:text-3xl">
          Competitor Price Intelligence
        </h1>
        <p className="max-w-2xl text-tremor-default leading-6 text-dark-tremor-content">
          30-day price bands, volatility exposure, and arbitrage spreads across
          tracked competitor listings.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-28 rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background px-4 py-3">
          <p className="text-tremor-label text-dark-tremor-content">Products</p>
          <p className="text-tremor-title font-semibold text-dark-tremor-content-strong">
            {productCount}
          </p>
        </div>
        <div className="min-w-28 rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background px-4 py-3">
          <p className="text-tremor-label text-dark-tremor-content">Snapshots</p>
          <p className="text-tremor-title font-semibold text-dark-tremor-content-strong">
            {snapshotCount}
          </p>
        </div>
        <ScrapeButton label="Run market scan" variant="default" size="default" />
      </div>
    </header>
  );
}
