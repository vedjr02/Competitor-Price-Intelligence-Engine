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
  priceStats: {
    average: number | null;
    lowest: number | null;
    lowestDate: string | null;
    highest: number | null;
  };
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
      average: null,
      lowest: null,
    }),
    priceStats: {
      average: null,
      lowest: null,
      lowestDate: null,
      highest: null,
    },
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
  average: number | null;
  lowest: number | null;
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
      name: "Average Price",
      stat:
        input.average != null ? formatter.format(input.average) : "—",
      limit: "30d mean",
      percentage: input.average != null ? 72 : 0,
    },
    {
      name: "Lowest Recorded",
      stat:
        input.lowest != null ? formatter.format(input.lowest) : "—",
      limit: "30d floor",
      percentage: input.lowest != null ? 58 : 0,
    },
    {
      name: "Latest Price",
      stat:
        input.latestPrice != null ? formatter.format(input.latestPrice) : "—",
      limit: changeLabel,
      percentage: input.latestPrice != null ? 100 : 0,
    },
    {
      name: "Volatility",
      stat: `${input.volatilityPercent.toFixed(1)}%`,
      limit: "30d CV",
      percentage: Math.min((input.volatilityPercent / 15) * 100, 100),
    },
  ];
}

function computePriceStats(prices: TrendPoint[]) {
  if (prices.length === 0) {
    return {
      average: null,
      lowest: null,
      lowestDate: null,
      highest: null,
    };
  }

  const values = prices.map((point) => point.price);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  let lowest = values[0];
  let lowestDate: string | null = prices[0].date;
  let highest = values[0];

  for (const point of prices) {
    if (point.price < lowest) {
      lowest = point.price;
      lowestDate = point.date;
    }
    if (point.price > highest) highest = point.price;
  }

  return { average, lowest, lowestDate, highest };
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
  const priceStats = computePriceStats(trends);

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
      average: priceStats.average,
      lowest: priceStats.lowest,
    }),
    priceStats,
    snapshotCount: historyEntries.length,
    isLiveData: true,
  };
}
