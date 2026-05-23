"use client";

import { ChevronDown, Package2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ProductOption } from "@/lib/products/selection";
import { classNames } from "@/lib/tremor/class-names";

type ProductSwitcherProps = {
  products: ProductOption[];
  selectedProduct: ProductOption | null;
  compact?: boolean;
};

export function ProductSwitcher({
  products,
  selectedProduct,
  compact = false,
}: ProductSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function handleSelect(productId: string) {
    setOpen(false);

    const response = await fetch("/api/products/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) return;

    startTransition(() => {
      router.refresh();
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Active product
        </p>
        <p className="mt-1 text-sm text-slate-400">Add a listing to begin</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={pending}
        className={classNames(
          "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] text-left transition hover:border-blue-400/30 hover:from-blue-500/10",
          compact ? "px-3 py-2.5" : "px-4 py-3.5",
          pending && "opacity-70",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
          <Package2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Viewing
          </p>
          <p className="truncate text-sm font-bold text-white">
            {selectedProduct?.name ?? "Select product"}
          </p>
          {!compact && selectedProduct ? (
            <p className="truncate text-xs text-slate-400">
              {selectedProduct.competitor}
              {selectedProduct.sku ? ` · ${selectedProduct.sku}` : ""}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={classNames(
            "size-4 shrink-0 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close product list"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 overflow-auto rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
            {products.map((product) => {
              const active = product.id === selectedProduct?.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product.id)}
                  className={classNames(
                    "flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition",
                    active
                      ? "bg-blue-500/15 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span className="truncate text-sm font-bold">{product.name}</span>
                  <span className="truncate text-xs text-slate-500">
                    {product.competitor}
                    {product.sku ? ` · ${product.sku}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
