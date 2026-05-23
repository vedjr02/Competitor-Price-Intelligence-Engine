import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

import type { ScrapeHistoryEntry, ScrapeRun } from "@/types/database";

type ScrapeHistoryPanelProps = {
  history: ScrapeHistoryEntry[];
  runs: ScrapeRun[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScrapeHistoryPanel({ history, runs }: ScrapeHistoryPanelProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
        <h3 className="font-medium text-dark-tremor-content-strong">
          Scrape run log
        </h3>
        <p className="text-tremor-default text-dark-tremor-content">
          Batch, cron, and manual scrape executions.
        </p>

        <div className="mt-6">
          {runs.length === 0 ? (
            <p className="text-tremor-default text-dark-tremor-content">
              No scrape runs logged yet.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Scraped</TableHeaderCell>
                  <TableHeaderCell>Failed</TableHeaderCell>
                  <TableHeaderCell>Started</TableHeaderCell>
                  <TableHeaderCell>Completed</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="capitalize">{run.run_type}</TableCell>
                    <TableCell>{run.products_scraped}</TableCell>
                    <TableCell>{run.products_failed}</TableCell>
                    <TableCell>{formatDate(run.started_at)}</TableCell>
                    <TableCell>
                      {run.completed_at ? formatDate(run.completed_at) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
        <h3 className="font-medium text-dark-tremor-content-strong">
          Price capture history
        </h3>
        <p className="text-tremor-default text-dark-tremor-content">
          Individual price snapshots from all scrape runs.
        </p>

        <div className="mt-6">
          {history.length === 0 ? (
            <p className="text-tremor-default text-dark-tremor-content">
              No price captures yet.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>SKU</TableHeaderCell>
                  <TableHeaderCell>Competitor</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Captured</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-dark-tremor-content-strong">
                      {entry.product_name}
                    </TableCell>
                    <TableCell>{entry.sku ?? "—"}</TableCell>
                    <TableCell>{entry.competitor}</TableCell>
                    <TableCell>{currency.format(entry.price)}</TableCell>
                    <TableCell>{formatDate(entry.scraped_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
