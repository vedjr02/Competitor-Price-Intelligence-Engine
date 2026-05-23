import { ArbitrageSpreads } from "@/components/dashboard/arbitrage-spreads";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PriceTrendChart } from "@/components/dashboard/price-trend-chart";
import { VolatilityMetrics } from "@/components/dashboard/volatility-metrics";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10">
      <DashboardHeader
        productCount={data.productCount}
        snapshotCount={data.snapshotCount}
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PriceTrendChart data={data.trends} />
        </div>
        <VolatilityMetrics data={data.volatilities} />
      </section>

      <section>
        <ArbitrageSpreads spreads={data.arbitrageSpreads} />
      </section>
    </div>
  );
}
