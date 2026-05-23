import { Badge } from "@/components/ui/badge";

type DashboardHeaderProps = {
  productCount: number;
  snapshotCount: number;
};

export function DashboardHeader({
  productCount,
  snapshotCount,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Live Market Intelligence
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Competitor Price Intelligence
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          30-day price trends, volatility metrics, and arbitrage spreads across
          tracked competitor listings.
        </p>
      </div>
      <div className="flex gap-3 text-sm">
        <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
          <p className="text-muted-foreground">Products</p>
          <p className="text-2xl font-semibold">{productCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
          <p className="text-muted-foreground">Snapshots</p>
          <p className="text-2xl font-semibold">{snapshotCount}</p>
        </div>
      </div>
    </header>
  );
}
