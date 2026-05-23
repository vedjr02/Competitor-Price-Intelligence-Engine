import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ArbitrageSpread } from "@/lib/analytics/arbitrage";

type ArbitrageSpreadsProps = {
  spreads: ArbitrageSpread[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function ArbitrageSpreads({ spreads }: ArbitrageSpreadsProps) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <CardTitle>Arbitrage Spreads</CardTitle>
        <CardDescription>
          Highest margin opportunities between competitor listings for the same
          product.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {spreads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No cross-competitor spreads detected yet.
          </p>
        ) : (
          spreads.map((spread) => (
            <div
              key={`${spread.productName}-${spread.lowCompetitor}-${spread.highCompetitor}`}
              className="rounded-xl border border-border/60 bg-background/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium capitalize">{spread.productName}</p>
                <Badge>{spread.spreadPercent.toFixed(1)}% spread</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>
                  Low: {spread.lowCompetitor} ·{" "}
                  <span className="text-foreground">
                    {currency.format(spread.lowPrice)}
                  </span>
                </p>
                <p>
                  High: {spread.highCompetitor} ·{" "}
                  <span className="text-foreground">
                    {currency.format(spread.highPrice)}
                  </span>
                </p>
              </div>
              <p className="mt-2 text-sm font-medium text-primary">
                Opportunity: {currency.format(spread.spread)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
