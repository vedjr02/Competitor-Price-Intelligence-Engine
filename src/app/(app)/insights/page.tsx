import { SkuGroupsPanel } from "@/components/insights/sku-groups-panel";
import { groupProductsBySku } from "@/lib/analytics/sku-groups";
import { getProductsWithLatestPrices } from "@/lib/products/get-products";

export default async function InsightsPage() {
  const products = await getProductsWithLatestPrices();

  const groups = groupProductsBySku(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      competitor: product.competitor,
      url: product.url,
      latestPrice: product.latest_price,
    })),
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3 border-b border-dark-tremor-border pb-8">
        <span className="rounded-tremor-small bg-dark-tremor-background-subtle px-2 py-1 text-tremor-label font-medium text-dark-tremor-content-emphasis">
          SKU insights
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-dark-tremor-content-strong sm:text-3xl">
          Competitor grouping
        </h1>
        <p className="max-w-2xl text-tremor-default leading-6 text-dark-tremor-content">
          Group listings by SKU to compare rival pricing and identify arbitrage
          spreads for the same product.
        </p>
      </header>

      <SkuGroupsPanel groups={groups} />
    </div>
  );
}
