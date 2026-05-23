"use client";

import { AreaChart, Title } from "@tremor/react";

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
        <p className="text-sm text-slate-400">
          No historical prices yet. Hit refresh price to capture the first
          snapshot.
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
