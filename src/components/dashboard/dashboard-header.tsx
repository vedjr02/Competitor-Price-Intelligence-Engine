import { ScrapeButton } from "@/components/products/scrape-button";
import { Badge } from "@/components/ui/badge";

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
    <header className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="w-fit">
            Live Market Intelligence
          </Badge>
          <Badge
            variant="outline"
            className={
              isLiveData
                ? "border-emerald-500/30 text-emerald-300"
                : "border-amber-500/30 text-amber-300"
            }
          >
            {isLiveData ? "Supabase connected" : "Configure Supabase"}
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Competitor Price Intelligence
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          30-day price trends, volatility metrics, and arbitrage spreads across
          tracked competitor listings.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
          <p className="text-muted-foreground">Products</p>
          <p className="text-2xl font-semibold">{productCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
          <p className="text-muted-foreground">Snapshots</p>
          <p className="text-2xl font-semibold">{snapshotCount}</p>
        </div>
        <ScrapeButton label="Run Market Scan" variant="default" size="default" />
      </div>
    </header>
  );
}
