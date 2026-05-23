import {
  calculateArbitrageSpreads,
  type ArbitrageSpread,
} from "@/lib/analytics/arbitrage";
import { getLatestTwoPrices } from "@/lib/analytics/price-change";
import {
  calculateVolatility,
  calculateVolatilityPercent,
} from "@/lib/analytics/volatility";
import type { KpiStat } from "@/components/dashboard/kpi-grid";
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
  kpis: KpiStat[];
  productCount: number;
  snapshotCount: number;
  isLiveData: boolean;
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function buildEmptyDashboard(): DashboardData {
  return {
    trends: [],
    volatilities: [],
    arbitrageSpreads: [],
    trackedProducts: [],
    kpis: [
      {
        label: "Tracked Products",
        value: "0",
        helper: "Add competitor listings to begin",
      },
      {
        label: "Avg Market Price",
        value: "—",
        helper: "No price snapshots yet",
      },
      {
        label: "Top Arbitrage Spread",
        value: "—",
        helper: "Needs 2+ competitors per SKU",
      },
      {
        label: "Avg Volatility",
        value: "—",
        helper: "30-day rolling window",
      },
    ],
    productCount: 0,
    snapshotCount: 0,
    isLiveData: hasSupabaseConfig(),
  };
}

function buildKpis(input: {
  productCount: number;
  snapshotCount: number;
  avgPrice: number;
  topSpread: ArbitrageSpread | null;
  avgVolatility: number;
  priceMovers: number;
}): KpiStat[] {
  const currency = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  });

  return [
    {
      label: "Tracked Products",
      value: String(input.productCount),
      helper: `${input.snapshotCount} price snapshots captured`,
    },
    {
      label: "Avg Market Price",
      value: input.avgPrice > 0 ? currency.format(input.avgPrice) : "—",
      helper: "Across latest competitor listings",
      trend: input.priceMovers > 0 ? "up" : "flat",
      trendLabel:
        input.priceMovers > 0 ? `${input.priceMovers} movers` : undefined,
    },
    {
      label: "Top Arbitrage Spread",
      value: input.topSpread
        ? `${input.topSpread.spreadPercent.toFixed(1)}%`
        : "—",
      helper: input.topSpread
        ? `${input.topSpread.lowCompetitor} → ${input.topSpread.highCompetitor}`
        : "Compare same SKU across rivals",
      trend: input.topSpread ? "up" : "flat",
      trendLabel: input.topSpread
        ? currency.format(input.topSpread.spread)
        : undefined,
    },
    {
      label: "Avg Volatility",
      value:
        input.avgVolatility > 0
          ? `${input.avgVolatility.toFixed(2)}%`
          : "—",
      helper: "30-day coefficient of variation",
      trend:
        input.avgVolatility > 5
          ? "up"
          : input.avgVolatility > 0
            ? "down"
            : "flat",
      trendLabel:
        input.avgVolatility > 5
          ? "Elevated"
          : input.avgVolatility > 0
            ? "Stable"
            : undefined,
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
    return buildEmptyDashboard();
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
  const latestPrices = trackedProducts
    .map((product) => product.latestPrice)
    .filter((price): price is number => price != null);

  const avgPrice =
    latestPrices.length > 0
      ? latestPrices.reduce((sum, price) => sum + price, 0) / latestPrices.length
      : 0;

  const avgVolatility =
    volatilities.length > 0
      ? volatilities.reduce(
          (sum, item) => sum + item.volatilityPercent,
          0,
        ) / volatilities.length
      : 0;

  const priceMovers = trackedProducts.filter(
    (product) =>
      product.priceChangePercent != null &&
      Math.abs(product.priceChangePercent) >= 1,
  ).length;

  return {
    trends,
    volatilities,
    arbitrageSpreads,
    trackedProducts,
    kpis: buildKpis({
      productCount: products.length,
      snapshotCount: historyEntries.length,
      avgPrice,
      topSpread: arbitrageSpreads[0] ?? null,
      avgVolatility,
      priceMovers,
    }),
    productCount: products.length,
    snapshotCount: historyEntries.length,
    isLiveData: true,
  };
}
