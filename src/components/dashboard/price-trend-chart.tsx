"use client";

import { AreaChart } from "@tremor/react";
import { useMemo, useState } from "react";

import type { TrendPoint } from "@/lib/dashboard/get-dashboard-data";
import { classNames } from "@/lib/tremor/class-names";

type PriceTrendChartProps = {
  data: TrendPoint[];
  currency?: string;
};

type Period = "7D" | "30D" | "90D";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(value);
}

export function PriceTrendChart({
  data,
  currency = "EUR",
}: PriceTrendChartProps) {
  const [period, setPeriod] = useState<Period>("30D");

  const filtered = useMemo(() => {
    const days = period === "7D" ? 7 : period === "30D" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return data.filter((point) => point.date >= cutoffStr);
  }, [data, period]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-300">Building price history</p>
        <p className="mt-2 text-sm text-slate-500">
          Each scrape adds a point. Scheduled captures run every 6 hours on
          Vercel.
        </p>
      </div>
    );
  }

  const chartData = filtered.map((point) => ({
    date: point.date,
    Price: point.price,
  }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filtered.length} snapshot{filtered.length === 1 ? "" : "s"} in range
        </p>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["7D", "30D", "90D"] as Period[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={classNames(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                period === option
                  ? "bg-emerald-500 text-[#022c22]"
                  : "text-slate-500 hover:text-white",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 1 ? (
        <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          First capture: {formatCurrency(filtered[0].price, currency)}. More
          points appear as automated scrapes run.
        </p>
      ) : null}

      <AreaChart
        className="mt-2 h-80"
        data={chartData}
        index="date"
        categories={["Price"]}
        colors={["emerald"]}
        valueFormatter={(value) => formatCurrency(value, currency)}
        yAxisWidth={72}
        showAnimation
        curveType="monotone"
        showLegend={false}
      />
    </div>
  );
}
