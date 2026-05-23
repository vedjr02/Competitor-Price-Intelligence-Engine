import {
  calculateArbitrageSpreads,
  type ArbitrageSpread,
} from "@/lib/analytics/arbitrage";
import {
  calculateVolatility,
  calculateVolatilityPercent,
} from "@/lib/analytics/volatility";
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

export type DashboardData = {
  trends: TrendPoint[];
  volatilities: ProductVolatility[];
  arbitrageSpreads: ArbitrageSpread[];
  productCount: number;
  snapshotCount: number;
};

const MOCK_TRENDS: TrendPoint[] = [
  { date: "2026-04-24", competitor: "Amazon", price: 129.99 },
  { date: "2026-04-30", competitor: "Amazon", price: 127.5 },
  { date: "2026-05-06", competitor: "Amazon", price: 124.99 },
  { date: "2026-05-12", competitor: "Amazon", price: 121.0 },
  { date: "2026-05-18", competitor: "Amazon", price: 119.99 },
  { date: "2026-05-23", competitor: "Amazon", price: 118.5 },
  { date: "2026-04-24", competitor: "BestBuy", price: 134.99 },
  { date: "2026-04-30", competitor: "BestBuy", price: 132.0 },
  { date: "2026-05-06", competitor: "BestBuy", price: 129.99 },
  { date: "2026-05-12", competitor: "BestBuy", price: 128.5 },
  { date: "2026-05-18", competitor: "BestBuy", price: 126.0 },
  { date: "2026-05-23", competitor: "BestBuy", price: 125.99 },
  { date: "2026-04-24", competitor: "Walmart", price: 122.99 },
  { date: "2026-04-30", competitor: "Walmart", price: 120.5 },
  { date: "2026-05-06", competitor: "Walmart", price: 118.99 },
  { date: "2026-05-12", competitor: "Walmart", price: 117.0 },
  { date: "2026-05-18", competitor: "Walmart", price: 115.99 },
  { date: "2026-05-23", competitor: "Walmart", price: 114.5 },
];

function buildMockDashboardData(): DashboardData {
  const latestByCompetitor = [
    { name: "Wireless Headphones Pro", competitor: "Amazon", latestPrice: 118.5 },
    { name: "Wireless Headphones Pro", competitor: "BestBuy", latestPrice: 125.99 },
    { name: "Wireless Headphones Pro", competitor: "Walmart", latestPrice: 114.5 },
  ];

  const pricesByCompetitor = new Map<string, number[]>();
  for (const point of MOCK_TRENDS) {
    const existing = pricesByCompetitor.get(point.competitor) ?? [];
    existing.push(point.price);
    pricesByCompetitor.set(point.competitor, existing);
  }

  const volatilities: ProductVolatility[] = latestByCompetitor.map((entry) => {
    const prices = pricesByCompetitor.get(entry.competitor) ?? [];
    return {
      productId: entry.competitor,
      productName: entry.name,
      competitor: entry.competitor,
      volatility: calculateVolatility(prices),
      volatilityPercent: calculateVolatilityPercent(prices),
      latestPrice: entry.latestPrice,
    };
  });

  return {
    trends: MOCK_TRENDS,
    volatilities,
    arbitrageSpreads: calculateArbitrageSpreads(latestByCompetitor),
    productCount: 3,
    snapshotCount: MOCK_TRENDS.length,
  };
}

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasSupabaseConfig()) {
    return buildMockDashboardData();
  }

  const supabase = createServerSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .returns<Product[]>();

  if (productsError || !products?.length) {
    return buildMockDashboardData();
  }

  const productIds = products.map((product) => product.id);

  const { data: history, error: historyError } = await supabase
    .from("price_history")
    .select("*")
    .in("product_id", productIds)
    .gte("scraped_at", since.toISOString())
    .order("scraped_at", { ascending: true })
    .returns<PriceHistory[]>();

  if (historyError || !history?.length) {
    return buildMockDashboardData();
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const trends: TrendPoint[] = history.map((entry) => {
    const product = productMap.get(entry.product_id)!;
    return {
      date: entry.scraped_at.slice(0, 10),
      competitor: product.competitor,
      price: Number(entry.price),
    };
  });

  const pricesByProduct = new Map<string, number[]>();
  for (const entry of history) {
    const existing = pricesByProduct.get(entry.product_id) ?? [];
    existing.push(Number(entry.price));
    pricesByProduct.set(entry.product_id, existing);
  }

  const latestByProduct = new Map<string, { price: number; scrapedAt: string }>();
  for (const entry of history) {
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

  return {
    trends,
    volatilities,
    arbitrageSpreads: calculateArbitrageSpreads(arbitrageInput),
    productCount: products.length,
    snapshotCount: history.length,
  };
}
