"use client";

import { Card, ProgressBar } from "@tremor/react";

export type ProgressMetric = {
  name: string;
  stat: string;
  limit: string;
  percentage: number;
};

type IntelligenceProgressCardsProps = {
  metrics: ProgressMetric[];
};

export function IntelligenceProgressCards({
  metrics,
}: IntelligenceProgressCardsProps) {
  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <Card
          key={item.name}
          className="border-dark-tremor-border bg-dark-tremor-background shadow-dark-tremor-card"
        >
          <dt className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            {item.name}
          </dt>
          <dd className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {item.stat}
          </dd>
          <ProgressBar value={item.percentage} className="mt-6" />
          <dd className="mt-2 flex items-center justify-between text-tremor-default">
            <span className="text-tremor-brand dark:text-dark-tremor-brand">
              {item.percentage.toFixed(1)}%
            </span>
            <span className="text-tremor-content dark:text-dark-tremor-content">
              {item.stat} of {item.limit}
            </span>
          </dd>
        </Card>
      ))}
    </dl>
  );
}
