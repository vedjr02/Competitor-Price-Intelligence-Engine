import { ExternalLink } from "lucide-react";

import {
  DeleteProductButton,
  ScrapeButton,
} from "@/components/products/scrape-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { ProductWithLatestPrice } from "@/types/database";

type ProductsTableProps = {
  products: ProductWithLatestPrice[];
  selectedProductId?: string | null;
};

function formatPrice(value: number | null, currencyCode: string) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProductsTable({
  products,
  selectedProductId,
}: ProductsTableProps) {
  return (
    <GlassPanel className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Your listings</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage tracked URLs, refresh prices, or remove old demo listings.
          </p>
        </div>
        <ScrapeButton label="Scrape All" variant="default" />
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">
          No products tracked yet. Add your first competitor listing above.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((product) => {
            const isActive = product.id === selectedProductId;

            return (
              <div
                key={product.id}
                className={`rounded-2xl border p-4 transition ${
                  isActive
                    ? "border-blue-400/30 bg-blue-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive ? (
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                          Active in overview
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                        {product.competitor}
                      </span>
                    </div>
                    <p className="truncate text-lg font-bold text-white">
                      {product.name}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                      <span>
                        SKU:{" "}
                        <span className="text-slate-200">
                          {product.sku ?? "—"}
                        </span>
                      </span>
                      <span>
                        Latest:{" "}
                        <span className="font-bold text-white">
                          {formatPrice(product.latest_price, product.currency)}
                        </span>
                      </span>
                      <span>Scraped: {formatDate(product.latest_scraped_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/5"
                    >
                      Open
                      <ExternalLink className="size-3.5" />
                    </a>
                    <ScrapeButton productId={product.id} />
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
