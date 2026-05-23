import { ExternalLink } from "lucide-react";

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
import type { ProductWithLatestPrice } from "@/types/database";

type ProductsTableProps = {
  products: ProductWithLatestPrice[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Tracked Listings</CardTitle>
          <CardDescription>
            Competitor URLs, latest captured prices, and scrape controls.
          </CardDescription>
        </div>
        <ScrapeButton label="Scrape All" variant="default" />
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products tracked yet. Add your first competitor listing above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Competitor</TableHead>
                <TableHead>Latest Price</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{product.name}</p>
                      {product.sku ? (
                        <p className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.competitor}</Badge>
                  </TableCell>
                  <TableCell>
                    {product.latest_price != null
                      ? currency.format(product.latest_price)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(product.latest_scraped_at)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View
                      <ExternalLink className="size-3.5" />
                    </a>
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
