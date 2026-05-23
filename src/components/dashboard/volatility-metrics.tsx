"use client";

import { BarChart } from "@tremor/react";

import type { ProductVolatility } from "@/lib/dashboard/get-dashboard-data";

type VolatilityMetricsProps = {
  data: ProductVolatility[];
  singleProduct?: boolean;
};

export function VolatilityMetrics({
  data,
  singleProduct = false,
}: VolatilityMetricsProps) {
  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-bold text-white">Price volatility</h3>
        <p className="mt-2 text-sm text-slate-400">
          Volatility appears after multiple price snapshots for this listing.
        </p>
      </div>
    );
  }

  const item = data[0];

  if (singleProduct && item) {
    return (
      <div>
        <h3 className="text-lg font-bold text-white">Price volatility</h3>
        <p className="mt-1 text-sm text-slate-400">
          Rolling coefficient of variation over the last 30 days.
        </p>
        <div className="mt-6 flex items-end gap-4">
          <p className="text-5xl font-bold tracking-tight text-white">
            {item.volatilityPercent.toFixed(1)}%
          </p>
          <p className="pb-2 text-sm text-slate-500">30d CV</p>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${Math.min(item.volatilityPercent * 6, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  const chartData = data.map((entry) => ({
    competitor: entry.competitor,
    "Volatility %": Number(entry.volatilityPercent.toFixed(2)),
  }));

  return (
    <div>
      <h3 className="text-lg font-bold text-white">Price volatility (30d)</h3>
      <p className="text-sm text-slate-400">
        Rolling coefficient of variation by competitor listing.
      </p>
      <BarChart
        className="mt-6 h-72"
        data={chartData}
        index="competitor"
        categories={["Volatility %"]}
        colors={["blue"]}
        valueFormatter={(value) => `${value.toFixed(2)}%`}
        yAxisWidth={48}
        showAnimation
      />
    </div>
  );
}
