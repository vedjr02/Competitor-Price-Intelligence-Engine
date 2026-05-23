import type { ArbitrageSpread } from "@/lib/analytics/arbitrage";
import { classNames } from "@/lib/tremor/class-names";

type ArbitrageSpreadsProps = {
  spreads: ArbitrageSpread[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function ArbitrageSpreads({ spreads }: ArbitrageSpreadsProps) {
  return (
    <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
      <h3 className="font-medium text-dark-tremor-content-strong">
        Arbitrage spreads
      </h3>
      <p className="text-tremor-default text-dark-tremor-content">
        Highest margin opportunities between competitor listings.
      </p>

      <div className="mt-6 space-y-3">
        {spreads.length === 0 ? (
          <p className="text-tremor-default text-dark-tremor-content">
            No cross-competitor spreads detected yet.
          </p>
        ) : (
          spreads.map((spread) => (
            <div
              key={`${spread.productName}-${spread.lowCompetitor}-${spread.highCompetitor}`}
              className="rounded-tremor-default border border-dark-tremor-border bg-slate-950/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium capitalize text-dark-tremor-content-strong">
                  {spread.productName}
                </p>
                <span className="rounded-tremor-small bg-blue-500/10 px-2 py-1 text-tremor-label font-medium text-blue-400">
                  {spread.spreadPercent.toFixed(1)}% spread
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-tremor-default text-dark-tremor-content md:grid-cols-2">
                <p>
                  Low: {spread.lowCompetitor} ·{" "}
                  <span className="font-medium text-dark-tremor-content-strong">
                    {currency.format(spread.lowPrice)}
                  </span>
                </p>
                <p>
                  High: {spread.highCompetitor} ·{" "}
                  <span className="font-medium text-dark-tremor-content-strong">
                    {currency.format(spread.highPrice)}
                  </span>
                </p>
              </div>
              <p
                className={classNames(
                  "mt-2 text-tremor-default font-medium",
                  spread.spread > 0 ? "text-emerald-400" : "text-dark-tremor-content",
                )}
              >
                Opportunity: {currency.format(spread.spread)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
