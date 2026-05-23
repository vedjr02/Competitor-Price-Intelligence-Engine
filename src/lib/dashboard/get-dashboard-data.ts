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
import { buildDemoDashboardData } from "@/lib/dashboard/demo-data";
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
  trends: TrendPoint[];
  volatilities: ProductVolatility[];
  arbitrageSpreads: ArbitrageSpread[];
  trackedProducts: TrackedProductRow[];
  costComparison: CostComparisonPoint[];
  costComparisonSummary: CostComparisonSummary[];
  progressMetrics: ProgressMetric[];
  productCount: number;
  snapshotCount: number;
  isLiveData: boolean;
  isDemoData?: boolean;
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function buildEmptyDashboard(): DashboardData {
  return buildDemoDashboardData();
}

function buildProgressMetrics(input: {
  productCount: number;
  snapshotCount: number;
  scrapedProducts: number;
  avgVolatility: number;
  arbitrageCount: number;
}): ProgressMetric[] {
  const productTarget = 12;
  const snapshotTarget = 120;
  const scrapeCoverage =
    input.productCount === 0
      ? 0
      : (input.scrapedProducts / input.productCount) * 100;
  const volatilityCap = 15;

  return [
    {
      name: "Tracked Listings",
      stat: String(input.productCount),
      limit: String(productTarget),
      percentage: Math.min((input.productCount / productTarget) * 100, 100),
    },
    {
      name: "Price Snapshots",
      stat: String(input.snapshotCount),
      limit: String(snapshotTarget),
      percentage: Math.min((input.snapshotCount / snapshotTarget) * 100, 100),
    },
    {
      name: "Scrape Coverage",
      stat: `${input.scrapedProducts}`,
      limit: `${input.productCount || 0}`,
      percentage: scrapeCoverage,
    },
    {
      name: "Volatility Index",
      stat: `${input.avgVolatility.toFixed(1)}%`,
      limit: `${volatilityCap}%`,
      percentage: Math.min((input.avgVolatility / volatilityCap) * 100, 100),
    },
  ];
}

export async function getDashboardData(): Promise<DashboardData> {
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
    return buildDemoDashboardData();
  }

  const productIds = products.map((product) => product.id);

  const { data: history, error: historyError } = await supabase
    .from("price_history")
    .select("*")
    .in("product_id", productIds)
    .gte("scraped_at", since.toISOString())
    .order("scraped_at", { ascending: true })
    .returns<PriceHistory[]>();

  const productMap = new Map(products.map((product) => [product.id, product]));
  const historyEntries = history ?? [];

  if (historyEntries.length === 0) {
    return buildDemoDashboardData();
  }

  const trends: TrendPoint[] = historyEntries.map((entry) => {
    const product = productMap.get(entry.product_id)!;
    return {
      date: entry.scraped_at.slice(0, 10),
      competitor: product.competitor,
      price: Number(entry.price),
    };
  });

  const pricesByProduct = new Map<string, number[]>();
  for (const entry of historyEntries) {
    const existing = pricesByProduct.get(entry.product_id) ?? [];
    existing.push(Number(entry.price));
    pricesByProduct.set(entry.product_id, existing);
  }

  const latestByProduct = new Map<string, { price: number; scrapedAt: string }>();
  for (const entry of historyEntries) {
    const current = latestByProduct.get(entry.product_id);
    if (!current || entry.scraped_at > current.scrapedAt) {
      latestByProduct.set(entry.product_id, {
        price: Number(entry.price),
        scrapedAt: entry.scraped_at,
      });
    }
  }

  const volatilities: ProductVolatility[] = products.map((product) => {
    const prices = pricesByProduct.get(product.id) ?? [];
    const latest = latestByProduct.get(product.id);

    return {
      productId: product.id,
      productName: product.name,
      competitor: product.competitor,
      volatility: calculateVolatility(prices),
      volatilityPercent: calculateVolatilityPercent(prices),
      latestPrice: latest?.price ?? 0,
    };
  });

  const trackedProducts: TrackedProductRow[] = products.map((product) => {
    const prices = pricesByProduct.get(product.id) ?? [];
    const latest = latestByProduct.get(product.id);
    const change = getLatestTwoPrices(prices);

    return {
      id: product.id,
      name: product.name,
      competitor: product.competitor,
      latestPrice: latest?.price ?? null,
      latestScrapedAt: latest?.scrapedAt ?? null,
      priceChangePercent: change?.deltaPercent ?? null,
    };
  });

  const arbitrageInput = products
    .map((product) => {
      const latest = latestByProduct.get(product.id);
      if (!latest) return null;

      return {
        name: product.name,
        competitor: product.competitor,
        latestPrice: latest.price,
      };
    })
    .filter(Boolean) as Array<{
    name: string;
    competitor: string;
    latestPrice: number;
  }>;

  const arbitrageSpreads = calculateArbitrageSpreads(arbitrageInput);

  const avgVolatility =
    volatilities.length > 0
      ? volatilities.reduce(
          (sum, item) => sum + item.volatilityPercent,
          0,
        ) / volatilities.length
      : 0;

  const scrapedProducts = trackedProducts.filter(
    (product) => product.latestPrice != null,
  ).length;

  const { chartData, summary } = buildCostComparisonData(trends);

  return {
    trends,
    volatilities,
    arbitrageSpreads,
    trackedProducts,
    costComparison: chartData,
    costComparisonSummary: summary,
    progressMetrics: buildProgressMetrics({
      productCount: products.length,
      snapshotCount: historyEntries.length,
      scrapedProducts,
      avgVolatility,
      arbitrageCount: arbitrageSpreads.length,
    }),
    productCount: products.length,
    snapshotCount: historyEntries.length,
    isLiveData: true,
  };
}
