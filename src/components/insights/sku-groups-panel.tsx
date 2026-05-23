import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

import type { SkuGroup } from "@/lib/analytics/sku-groups";

type SkuGroupsPanelProps = {
  groups: SkuGroup[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function SkuGroupsPanel({ groups }: SkuGroupsPanelProps) {
  return (
    <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
      <h3 className="font-medium text-dark-tremor-content-strong">
        SKU competitor grouping
      </h3>
      <p className="text-tremor-default text-dark-tremor-content">
        Compare the same product across rivals, grouped by SKU or product name.
      </p>

      <div className="mt-6 space-y-6">
        {groups.length === 0 ? (
          <p className="text-tremor-default text-dark-tremor-content">
            Add products with matching SKUs to enable cross-competitor grouping.
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group.sku}
              className="rounded-tremor-default border border-dark-tremor-border bg-slate-950/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-dark-tremor-content-strong">
                    {group.productName}
                  </p>
                  <p className="text-tremor-label text-dark-tremor-content">
                    SKU: {group.sku}
                  </p>
                </div>
                {group.spread != null ? (
                  <span className="rounded-tremor-small bg-blue-500/10 px-2 py-1 text-tremor-label font-medium text-blue-400">
                    {group.spreadPercent?.toFixed(1)}% spread ·{" "}
                    {currency.format(group.spread)}
                  </span>
                ) : null}
              </div>

              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Competitor</TableHeaderCell>
                    <TableHeaderCell>Latest price</TableHeaderCell>
                    <TableHeaderCell>Listing</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.competitors.map((competitor) => (
                    <TableRow key={competitor.productId}>
                      <TableCell>{competitor.competitor}</TableCell>
                      <TableCell>
                        {competitor.latestPrice != null
                          ? currency.format(competitor.latestPrice)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-dark-tremor-brand hover:underline"
                        >
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
