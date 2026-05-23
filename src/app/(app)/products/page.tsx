import { AddProductForm } from "@/components/products/add-product-form";
import { ProductsTable } from "@/components/products/products-table";
import { getProductsWithLatestPrices } from "@/lib/products/get-products";
import {
  getProductCatalog,
  getSelectedProductId,
} from "@/lib/products/selection";

export default async function ProductsPage() {
  const [products, selectedProductId] = await Promise.all([
    getProductsWithLatestPrices(),
    getSelectedProductId(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Product registry
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Competitor listings
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Add URLs here. Switch the active product from the sidebar to change
          what the overview shows.
        </p>
      </header>

      <AddProductForm />
      <ProductsTable
        products={products}
        selectedProductId={selectedProductId}
      />
    </div>
  );
}
