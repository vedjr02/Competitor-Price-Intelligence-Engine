import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiStat = {
  label: string;
  value: string;
  helper: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
};

type KpiGridProps = {
  stats: KpiStat[];
};

function TrendIcon({ trend }: { trend: KpiStat["trend"] }) {
  if (trend === "up") return <ArrowUpRight className="size-4" />;
  if (trend === "down") return <ArrowDownRight className="size-4" />;
  return <Minus className="size-4" />;
}

export function KpiGrid({ stats }: KpiGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/60 bg-card/70 backdrop-blur"
        >
          <CardHeader className="pb-2">
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              {stat.value}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">{stat.helper}</p>
            {stat.trend && stat.trendLabel ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                  stat.trend === "up" && "bg-rose-500/10 text-rose-300",
                  stat.trend === "down" && "bg-emerald-500/10 text-emerald-300",
                  stat.trend === "flat" && "bg-muted text-muted-foreground",
                )}
              >
                <TrendIcon trend={stat.trend} />
                {stat.trendLabel}
              </span>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
