import {
  DashboardHeader,
  DashboardHeroStats,
  DashboardTrendSection,
} from "@/components/dashboard/dashboard-header";
import { VolatilityMetrics } from "@/components/dashboard/volatility-metrics";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { requireSelectedProduct } from "@/lib/products/selection";

export default async function DashboardPage() {
  const selectedProduct = await requireSelectedProduct();
  const data = await getDashboardData(selectedProduct?.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <DashboardHeader data={data} />
      <DashboardHeroStats data={data} />
      <DashboardTrendSection data={data} />

      <section className="grid gap-6 xl:grid-cols-2">
        <GlassPanel className="p-6">
          <VolatilityMetrics data={data.volatilities} singleProduct />
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="text-lg font-bold text-white">Capture status</h2>
          <p className="mt-1 text-sm text-slate-400">
            Snapshot activity for this product over the last 30 days.
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total snapshots
              </dt>
              <dd className="mt-2 text-2xl font-bold text-white">
                {data.snapshotCount}
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Competitor
              </dt>
              <dd className="mt-2 text-2xl font-bold text-white">
                {data.product?.competitor ?? "—"}
              </dd>
            </div>
          </dl>
        </GlassPanel>
      </section>
    </div>
  );
}
