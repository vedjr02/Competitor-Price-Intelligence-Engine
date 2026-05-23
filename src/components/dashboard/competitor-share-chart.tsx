"use client";

import { Card, DonutChart, Title } from "@tremor/react";

import type { TrackedProductRow } from "@/lib/dashboard/get-dashboard-data";

type CompetitorShareChartProps = {
  products: TrackedProductRow[];
};

export function CompetitorShareChart({ products }: CompetitorShareChartProps) {
  const priced = products.filter((product) => product.latestPrice != null);

  if (priced.length === 0) {
    return (
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <Title className="text-foreground">Competitor Price Share</Title>
        <p className="mt-6 text-sm text-muted-foreground">
          Relative price positioning appears once listings have captured prices.
        </p>
      </Card>
    );
  }

  const chartData = priced.map((product) => ({
    name: product.competitor,
    share: product.latestPrice as number,
  }));

  const valueFormatter = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <Title className="text-foreground">Competitor Price Share</Title>
      <DonutChart
        className="mt-6 h-64"
        data={chartData}
        category="share"
        index="name"
        valueFormatter={valueFormatter}
        colors={["blue", "cyan", "violet", "amber", "rose"]}
        showAnimation
      />
    </Card>
  );
}
