import { ArbitrageSpreads } from "@/components/dashboard/arbitrage-spreads";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MarketPulseTable } from "@/components/dashboard/market-pulse-table";
import { VolatilityMetrics } from "@/components/dashboard/volatility-metrics";
import { CostComparisonChart } from "@/components/tremor-blocks/cost-comparison-chart";
import { IntelligenceProgressCards } from "@/components/tremor-blocks/intelligence-progress-cards";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <DashboardHeader
        productCount={data.productCount}
        snapshotCount={data.snapshotCount}
        isLiveData={data.isLiveData}
      />

      <IntelligenceProgressCards metrics={data.progressMetrics} />

      <CostComparisonChart
        data={data.costComparison}
        summary={data.costComparisonSummary}
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VolatilityMetrics data={data.volatilities} />
        </div>
        <ArbitrageSpreads spreads={data.arbitrageSpreads} />
      </section>

      <MarketPulseTable products={data.trackedProducts} />
    </div>
  );
}
