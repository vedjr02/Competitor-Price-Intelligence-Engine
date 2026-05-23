import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

import { ScrapeButton } from "@/components/products/scrape-button";
import type { TrackedProductRow } from "@/lib/dashboard/get-dashboard-data";

type MarketPulseTableProps = {
  products: TrackedProductRow[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function MarketPulseTable({ products }: MarketPulseTableProps) {
  return (
    <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-dark-tremor-content-strong">
            Market pulse
          </h3>
          <p className="text-tremor-default text-dark-tremor-content">
            Latest captured prices and short-term movement across tracked rivals.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-tremor-default font-medium text-dark-tremor-brand hover:underline"
        >
          Manage products
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-6">
        {products.length === 0 ? (
          <div className="rounded-tremor-default border border-dashed border-dark-tremor-border p-8 text-center">
            <p className="text-tremor-default text-dark-tremor-content">
              No live market data yet. Add products and run a scrape to populate
              this view.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/products"
                className="text-tremor-default font-medium text-dark-tremor-brand hover:underline"
              >
                Add first product
              </Link>
              <ScrapeButton label="Scrape all" variant="default" size="default" />
            </div>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Competitor</TableHeaderCell>
                <TableHeaderCell>Latest</TableHeaderCell>
                <TableHeaderCell>Change</TableHeaderCell>
                <TableHeaderCell className="text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-dark-tremor-content-strong">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.competitor}</TableCell>
                  <TableCell>
                    {product.latestPrice != null
                      ? currency.format(product.latestPrice)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {product.priceChangePercent != null ? (
                      <span
                        className={
                          product.priceChangePercent > 0
                            ? "text-rose-400"
                            : product.priceChangePercent < 0
                              ? "text-emerald-400"
                              : "text-dark-tremor-content"
                        }
                      >
                        {product.priceChangePercent > 0 ? "+" : ""}
                        {product.priceChangePercent.toFixed(2)}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ScrapeButton productId={product.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
