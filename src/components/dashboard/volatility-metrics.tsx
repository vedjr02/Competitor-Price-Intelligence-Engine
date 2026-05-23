"use client";

import { BarChart } from "@tremor/react";

import type { ProductVolatility } from "@/lib/dashboard/get-dashboard-data";

type VolatilityMetricsProps = {
  data: ProductVolatility[];
};

export function VolatilityMetrics({ data }: VolatilityMetricsProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
        <h3 className="font-medium text-dark-tremor-content-strong">
          Price volatility (30d)
        </h3>
        <p className="mt-2 text-tremor-default text-dark-tremor-content">
          Volatility appears after multiple price snapshots per competitor.
        </p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    competitor: item.competitor,
    "Volatility %": Number(item.volatilityPercent.toFixed(2)),
  }));

  return (
    <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
      <h3 className="font-medium text-dark-tremor-content-strong">
        Price volatility (30d)
      </h3>
      <p className="text-tremor-default text-dark-tremor-content">
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
