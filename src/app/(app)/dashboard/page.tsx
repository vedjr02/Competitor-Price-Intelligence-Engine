import {
  DashboardHeader,
  DashboardHeroStats,
  DashboardInsightsPanel,
  DashboardTrendSection,
} from "@/components/dashboard/dashboard-header";
import { AlertPreferencesPanel } from "@/components/dashboard/alert-preferences-panel";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { requireSelectedProduct } from "@/lib/products/selection";

export default async function DashboardPage() {
  const selectedProduct = await requireSelectedProduct();
  const data = await getDashboardData(selectedProduct?.id);

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <DashboardHeader data={data} />
      <DashboardHeroStats data={data} />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <DashboardTrendSection data={data} />
          <AlertPreferencesPanel
            productId={data.product?.id ?? null}
            productName={data.product?.name ?? null}
          />
        </div>
        <DashboardInsightsPanel data={data} />
      </div>
    </div>
  );
}
