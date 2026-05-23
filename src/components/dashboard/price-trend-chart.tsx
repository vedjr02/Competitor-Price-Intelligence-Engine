"use client";

import { Card, LineChart, Title } from "@tremor/react";

import type { TrendPoint } from "@/lib/dashboard/get-dashboard-data";

type PriceTrendChartProps = {
  data: TrendPoint[];
};

const valueFormatter = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <Title className="text-foreground">30-Day Price Trends</Title>
        <p className="mt-6 text-sm text-muted-foreground">
          No historical prices yet. Scrape competitor listings to build the
          trend line.
        </p>
      </Card>
    );
  }

  const chartData = Object.values(
    data.reduce<Record<string, Record<string, string | number>>>((acc, point) => {
      if (!acc[point.date]) {
        acc[point.date] = { date: point.date };
      }
      acc[point.date][point.competitor] = point.price;
      return acc;
    }, {}),
  );

  const competitors = [...new Set(data.map((point) => point.competitor))];

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <Title className="text-foreground">30-Day Price Trends</Title>
      <LineChart
        className="mt-6 h-72"
        data={chartData}
        index="date"
        categories={competitors}
        colors={["blue", "emerald", "violet", "amber", "rose"]}
        valueFormatter={valueFormatter}
        yAxisWidth={72}
        showAnimation
        curveType="monotone"
      />
    </Card>
  );
}
