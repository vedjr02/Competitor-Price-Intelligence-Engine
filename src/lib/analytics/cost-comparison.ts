import type { TrendPoint } from "@/lib/dashboard/get-dashboard-data";

export type CostComparisonPoint = {
  date: string;
  "Market High": number;
  "Market Low": number;
  "Arbitrage margin": number;
};

export type CostComparisonSummary = {
  category: string;
  total: string;
  color: string | null;
};

export function buildCostComparisonData(trends: TrendPoint[]): {
  chartData: CostComparisonPoint[];
  summary: CostComparisonSummary[];
} {
  if (trends.length === 0) {
    return { chartData: [], summary: [] };
  }

  const byDate = new Map<string, number[]>();

  for (const point of trends) {
    const existing = byDate.get(point.date) ?? [];
    existing.push(point.price);
    byDate.set(point.date, existing);
  }

  const chartData: CostComparisonPoint[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, prices]) => {
      const marketHigh = Math.max(...prices);
      const marketLow = Math.min(...prices);
      const arbitrageMargin =
        marketLow === 0 ? 0 : ((marketHigh - marketLow) / marketLow) * -100;

      return {
        date: formatChartDate(date),
        "Market High": marketHigh,
        "Market Low": marketLow,
        "Arbitrage margin": Number(arbitrageMargin.toFixed(1)),
      };
    });

  const highTotal = chartData.reduce((sum, row) => sum + row["Market High"], 0);
  const lowTotal = chartData.reduce((sum, row) => sum + row["Market Low"], 0);
  const savingsTotal = highTotal - lowTotal;
  const avgMargin =
    chartData.reduce((sum, row) => sum + row["Arbitrage margin"], 0) /
    chartData.length;

  const currency = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  });

  const summary: CostComparisonSummary[] = [
    {
      category: "Market High",
      total: currency.format(highTotal),
      color: "bg-blue-500",
    },
    {
      category: "Market Low",
      total: currency.format(lowTotal),
      color: "bg-cyan-500",
    },
    {
      category: "Arbitrage margin (%)",
      total: `${avgMargin.toFixed(1)}%`,
      color: null,
    },
    {
      category: "Arbitrage opportunity",
      total: currency.format(savingsTotal),
      color: null,
    },
  ];

  return { chartData, summary };
}

function formatChartDate(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-IE", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 1,
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}
