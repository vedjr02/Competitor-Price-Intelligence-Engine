import { buildCostComparisonData } from "@/lib/analytics/cost-comparison";
import { calculateArbitrageSpreads } from "@/lib/analytics/arbitrage";
import {
  calculateVolatility,
  calculateVolatilityPercent,
} from "@/lib/analytics/volatility";
import type { DashboardData, TrendPoint } from "@/lib/dashboard/get-dashboard-data";

const DEMO_TRENDS: TrendPoint[] = [
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

export function buildDemoDashboardData(): DashboardData {
  const amazonPrices = DEMO_TRENDS.filter((p) => p.competitor === "Amazon").map(
    (p) => p.price,
  );
  const bestBuyPrices = DEMO_TRENDS.filter((p) => p.competitor === "BestBuy").map(
    (p) => p.price,
  );
  const walmartPrices = DEMO_TRENDS.filter((p) => p.competitor === "Walmart").map(
    (p) => p.price,
  );

  const volatilities = [
    {
      productId: "demo-amazon",
      productName: "Wireless Headphones Pro",
      competitor: "Amazon",
      volatility: calculateVolatility(amazonPrices),
      volatilityPercent: calculateVolatilityPercent(amazonPrices),
      latestPrice: 118.5,
    },
    {
      productId: "demo-bestbuy",
      productName: "Wireless Headphones Pro",
      competitor: "BestBuy",
      volatility: calculateVolatility(bestBuyPrices),
      volatilityPercent: calculateVolatilityPercent(bestBuyPrices),
      latestPrice: 125.99,
    },
    {
      productId: "demo-walmart",
      productName: "Wireless Headphones Pro",
      competitor: "Walmart",
      volatility: calculateVolatility(walmartPrices),
      volatilityPercent: calculateVolatilityPercent(walmartPrices),
      latestPrice: 114.5,
    },
  ];

  const arbitrageSpreads = calculateArbitrageSpreads([
    { name: "Wireless Headphones Pro", competitor: "Amazon", latestPrice: 118.5 },
    { name: "Wireless Headphones Pro", competitor: "BestBuy", latestPrice: 125.99 },
    { name: "Wireless Headphones Pro", competitor: "Walmart", latestPrice: 114.5 },
  ]);

  const { chartData, summary } = buildCostComparisonData(DEMO_TRENDS);
  const avgVolatility =
    volatilities.reduce((sum, v) => sum + v.volatilityPercent, 0) /
    volatilities.length;

  return {
    trends: DEMO_TRENDS,
    volatilities,
    arbitrageSpreads,
    trackedProducts: [
      {
        id: "demo-amazon",
        name: "Wireless Headphones Pro",
        competitor: "Amazon",
        latestPrice: 118.5,
        latestScrapedAt: "2026-05-23T12:00:00Z",
        priceChangePercent: -1.24,
      },
      {
        id: "demo-bestbuy",
        name: "Wireless Headphones Pro",
        competitor: "BestBuy",
        latestPrice: 125.99,
        latestScrapedAt: "2026-05-23T12:00:00Z",
        priceChangePercent: -0.01,
      },
      {
        id: "demo-walmart",
        name: "Wireless Headphones Pro",
        competitor: "Walmart",
        latestPrice: 114.5,
        latestScrapedAt: "2026-05-23T12:00:00Z",
        priceChangePercent: -1.28,
      },
    ],
    costComparison: chartData,
    costComparisonSummary: summary,
    progressMetrics: [
      {
        name: "Tracked Listings",
        stat: "3",
        limit: "12",
        percentage: 25,
      },
      {
        name: "Price Snapshots",
        stat: "18",
        limit: "120",
        percentage: 15,
      },
      {
        name: "Scrape Coverage",
        stat: "3",
        limit: "3",
        percentage: 100,
      },
      {
        name: "Volatility Index",
        stat: `${avgVolatility.toFixed(1)}%`,
        limit: "15%",
        percentage: Math.min((avgVolatility / 15) * 100, 100),
      },
    ],
    productCount: 3,
    snapshotCount: 18,
    isLiveData: true,
    isDemoData: true,
  };
}
