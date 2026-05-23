import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ScrapeButton } from "@/components/products/scrape-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Market Pulse</CardTitle>
          <CardDescription>
            Latest captured prices and short-term movement across tracked rivals.
          </CardDescription>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Manage products
          <ArrowRight className="size-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No live market data yet. Add products and run a scrape to populate
              this view.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/products"
                className="text-sm font-medium text-primary hover:underline"
              >
                Add first product
              </Link>
              <ScrapeButton label="Scrape All" variant="default" size="default" />
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Competitor</TableHead>
                <TableHead>Latest</TableHead>
                <TableHead>Change</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.competitor}</Badge>
                  </TableCell>
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
                            ? "text-rose-300"
                            : product.priceChangePercent < 0
                              ? "text-emerald-300"
                              : "text-muted-foreground"
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
      </CardContent>
    </Card>
  );
}
