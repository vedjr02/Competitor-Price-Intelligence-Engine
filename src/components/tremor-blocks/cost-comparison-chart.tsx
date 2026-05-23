"use client";

import { AreaChart, type CustomTooltipProps } from "@tremor/react";

import {
  compactCurrency,
  type CostComparisonPoint,
  type CostComparisonSummary,
} from "@/lib/analytics/cost-comparison";
import { classNames } from "@/lib/tremor/class-names";

type CostComparisonChartProps = {
  data: CostComparisonPoint[];
  summary: CostComparisonSummary[];
};

function CustomTooltip({ payload, active, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const margin = (payload[0]?.payload as CostComparisonPoint | undefined)?.[
    "Arbitrage margin"
  ] ?? 0;

  return (
    <div className="rounded-tremor-default border border-tremor-border bg-tremor-background text-tremor-default shadow-tremor-dropdown dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:shadow-dark-tremor-dropdown">
      <div className="border-b border-tremor-border px-4 py-2 dark:border-dark-tremor-border">
        <p className="font-medium text-tremor-content dark:text-dark-tremor-content">
          {label}
        </p>
      </div>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between space-x-8">
          <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Arbitrage margin
          </p>
          <span
            className={classNames(
              Number(margin) < 0
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400"
                : "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400",
              "inline-flex rounded px-2 py-0.5 text-tremor-label font-medium",
            )}
          >
            {margin}%
          </span>
        </div>
        <div className="mt-2 space-y-1">
          {payload.map((category) => (
            <div
              key={String(category.dataKey)}
              className="flex items-center justify-between space-x-8"
            >
              <div className="flex items-center space-x-2">
                <span
                  className={classNames(
                    "h-1 w-3 shrink-0 rounded-sm",
                    category.dataKey === "Market High"
                      ? "bg-blue-500"
                      : "bg-cyan-500",
                  )}
                  aria-hidden
                />
                <p className="text-tremor-content dark:text-dark-tremor-content">
                  {category.dataKey}
                </p>
              </div>
              <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {compactCurrency(Number(category.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CostComparisonChart({ data, summary }: CostComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Market high vs. market low
        </h3>
        <p className="mt-2 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
          Add products and run a market scan to compare competitor price bands.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
      <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Market high vs. market low
      </h3>
      <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
        Daily ceiling and floor prices across tracked competitors, with implied
        arbitrage margin.
      </p>

      <ul role="list" className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {summary.map((item) => (
          <li key={item.category}>
            <div className="flex space-x-3">
              {item.color ? (
                <span
                  className={classNames(item.color, "w-1 shrink-0 rounded")}
                  aria-hidden
                />
              ) : null}
              <p className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {item.total}
              </p>
            </div>
            <p
              className={classNames(
                item.color ? "pl-4" : "",
                "text-tremor-default text-tremor-content dark:text-dark-tremor-content",
              )}
            >
              {item.category}
            </p>
          </li>
        ))}
      </ul>

      <AreaChart
        data={data}
        index="date"
        categories={["Market High", "Market Low"]}
        colors={["blue", "cyan"]}
        showLegend={false}
        showGradient={false}
        yAxisWidth={55}
        valueFormatter={compactCurrency}
        customTooltip={CustomTooltip}
        className="mt-8 hidden h-72 sm:block"
      />
      <AreaChart
        data={data}
        index="date"
        categories={["Market High", "Market Low"]}
        colors={["blue", "cyan"]}
        showLegend={false}
        showGradient={false}
        showYAxis={false}
        startEndOnly
        valueFormatter={compactCurrency}
        customTooltip={CustomTooltip}
        className="mt-6 h-72 sm:hidden"
      />
    </div>
  );
}
