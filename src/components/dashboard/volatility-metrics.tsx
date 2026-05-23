"use client";

import { BarChart, Card, Title } from "@tremor/react";

import type { ProductVolatility } from "@/lib/dashboard/get-dashboard-data";

type VolatilityMetricsProps = {
  data: ProductVolatility[];
};

export function VolatilityMetrics({ data }: VolatilityMetricsProps) {
  const chartData = data.map((item) => ({
    competitor: item.competitor,
    "Volatility %": Number(item.volatilityPercent.toFixed(2)),
  }));

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <Title className="text-foreground">Price Volatility (30d)</Title>
      <BarChart
        className="mt-6 h-72"
        data={chartData}
        index="competitor"
        categories={["Volatility %"]}
        colors={["cyan"]}
        valueFormatter={(value) => `${value.toFixed(2)}%`}
        yAxisWidth={48}
        showAnimation
      />
    </Card>
  );
}
