import {
  buildCostComparisonData,
  type CostComparisonPoint,
  type CostComparisonSummary,
} from "@/lib/analytics/cost-comparison";
import {
  calculateArbitrageSpreads,
  type ArbitrageSpread,
} from "@/lib/analytics/arbitrage";
import { getLatestTwoPrices } from "@/lib/analytics/price-change";
import {
  calculateVolatility,
  calculateVolatilityPercent,
} from "@/lib/analytics/volatility";
import type { ProgressMetric } from "@/components/tremor-blocks/intelligence-progress-cards";
import type { ProductOption } from "@/lib/products/selection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PriceHistory, Product } from "@/types/database";

export type TrendPoint = {
  date: string;
  competitor: string;
  price: number;
};

export type ProductVolatility = {
  productId: string;
  productName: string;
  competitor: string;
  volatility: number;
  volatilityPercent: number;
  latestPrice: number;
};

export type TrackedProductRow = {
  id: string;
  name: string;
  competitor: string;
  latestPrice: number | null;
  latestScrapedAt: string | null;
  priceChangePercent: number | null;
};

export type DashboardData = {
  product: ProductOption | null;
  trends: TrendPoint[];
  volatilities: ProductVolatility[];
  arbitrageSpreads: ArbitrageSpread[];
  trackedProducts: TrackedProductRow[];
  costComparison: CostComparisonPoint[];
  costComparisonSummary: CostComparisonSummary[];
  progressMetrics: ProgressMetric[];
  snapshotCount: number;
  isLiveData: boolean;
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function buildEmptyDashboard(product: ProductOption | null = null): DashboardData {
  return {
    product,
    trends: [],
    volatilities: [],
    arbitrageSpreads: [],
    trackedProducts: [],
    costComparison: [],
    costComparisonSummary: [],
    progressMetrics: buildProductMetrics({
      latestPrice: null,
      priceChangePercent: null,
      volatilityPercent: 0,
      snapshotCount: 0,
      currency: product?.currency ?? "EUR",
    }),
    snapshotCount: 0,
    isLiveData: hasSupabaseConfig(),
  };
}

function buildProductMetrics(input: {
  latestPrice: number | null;
  priceChangePercent: number | null;
  volatilityPercent: number;
  snapshotCount: number;
  currency: string;
}): ProgressMetric[] {
  const formatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: input.currency,
  });

  const changeLabel =
    input.priceChangePercent == null
      ? "—"
      : `${input.priceChangePercent >= 0 ? "+" : ""}${input.priceChangePercent.toFixed(1)}%`;

  return [
    {
      name: "Latest Price",
      stat:
        input.latestPrice != null ? formatter.format(input.latestPrice) : "—",
      limit: "Live",
      percentage: input.latestPrice != null ? 100 : 0,
    },
    {
      name: "30d Change",
      stat: changeLabel,
      limit: "vs prior",
      percentage:
        input.priceChangePercent == null
          ? 0
          : Math.min(Math.abs(input.priceChangePercent) * 4, 100),
    },
    {
      name: "Volatility",
      stat: `${input.volatilityPercent.toFixed(1)}%`,
      limit: "30d CV",
      percentage: Math.min((input.volatilityPercent / 15) * 100, 100),
    },
    {
      name: "Snapshots",
      stat: String(input.snapshotCount),
      limit: "30d",
      percentage: Math.min((input.snapshotCount / 30) * 100, 100),
    },
  ];
}

export async function getDashboardData(
  productId?: string | null,
): Promise<DashboardData> {
  if (!hasSupabaseConfig()) {
    return buildEmptyDashboard();
  }

  const supabase = createServerSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .returns<Product[]>();

  if (productsError || !products?.length) {
    return buildEmptyDashboard();
  }

  const activeProduct =
    products.find((product) => product.id === productId) ?? products[0];

  const productIds = [activeProduct.id];

  const { data: history } = await supabase
    .from("price_history")
    .select("*")
    .in("product_id", productIds)
    .gte("scraped_at", since.toISOString())
    .order("scraped_at", { ascending: true })
    .returns<PriceHistory[]>();

  const historyEntries = history ?? [];

  const trends: TrendPoint[] = historyEntries.map((entry) => ({
    date: entry.scraped_at.slice(0, 10),
    competitor: activeProduct.competitor,
    price: Number(entry.price),
  }));

  const prices = historyEntries.map((entry) => Number(entry.price));
  const latestEntry = historyEntries.at(-1);
  const change = getLatestTwoPrices(prices);

  const volatilityPercent = calculateVolatilityPercent(prices);

  const volatilities: ProductVolatility[] = [
    {
      productId: activeProduct.id,
      productName: activeProduct.name,
      competitor: activeProduct.competitor,
      volatility: calculateVolatility(prices),
      volatilityPercent,
      latestPrice: latestEntry ? Number(latestEntry.price) : 0,
    },
  ];

  const trackedProducts: TrackedProductRow[] = [
    {
      id: activeProduct.id,
      name: activeProduct.name,
      competitor: activeProduct.competitor,
      latestPrice: latestEntry ? Number(latestEntry.price) : null,
      latestScrapedAt: latestEntry?.scraped_at ?? null,
      priceChangePercent: change?.deltaPercent ?? null,
    },
  ];

  const arbitrageSpreads = latestEntry
    ? calculateArbitrageSpreads([
        {
          name: activeProduct.name,
          competitor: activeProduct.competitor,
          latestPrice: Number(latestEntry.price),
        },
      ])
    : [];

  const { chartData, summary } = buildCostComparisonData(trends);

  const product: ProductOption = {
    id: activeProduct.id,
    name: activeProduct.name,
    competitor: activeProduct.competitor,
    sku: activeProduct.sku,
    currency: activeProduct.currency,
    url: activeProduct.url,
  };

  return {
    product,
    trends,
    volatilities,
    arbitrageSpreads,
    trackedProducts,
    costComparison: chartData,
    costComparisonSummary: summary,
    progressMetrics: buildProductMetrics({
      latestPrice: latestEntry ? Number(latestEntry.price) : null,
      priceChangePercent: change?.deltaPercent ?? null,
      volatilityPercent,
      snapshotCount: historyEntries.length,
      currency: activeProduct.currency,
    }),
    snapshotCount: historyEntries.length,
    isLiveData: true,
  };
}
