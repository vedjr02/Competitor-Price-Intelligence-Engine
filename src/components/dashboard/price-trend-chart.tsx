"use client";

import { AreaChart } from "@tremor/react";

import type { TrendPoint } from "@/lib/dashboard/get-dashboard-data";

type PriceTrendChartProps = {
  data: TrendPoint[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-300">Building price history</p>
        <p className="mt-2 text-sm text-slate-400">
          Stores don&apos;t publish past prices — we record a snapshot each time
          we scrape. Your first point appears after adding a product or hitting
          refresh. Scheduled captures run every 6 hours once deployed.
        </p>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: point.date,
    Price: point.price,
  }));

  return (
    <div>
      {data.length === 1 ? (
        <p className="mb-4 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          Day 1 captured — {formatCurrency(data[0].price)}. The 30-day chart
          fills automatically as scheduled scrapes run (every 6 hours on
          Vercel).
        </p>
      ) : (
        <p className="mb-4 text-sm text-slate-400">
          {data.length} snapshots in the last 30 days — each point is a price
          capture, not data from the store&apos;s archives.
        </p>
      )}
      <AreaChart
        className="mt-2 h-80"
        data={chartData}
        index="date"
        categories={["Price"]}
        colors={["blue"]}
        valueFormatter={formatCurrency}
        yAxisWidth={72}
        showAnimation
        curveType="monotone"
        showLegend={false}
      />
    </div>
  );
}
