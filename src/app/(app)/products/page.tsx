import { AddProductForm } from "@/components/products/add-product-form";
import { ProductsTable } from "@/components/products/products-table";
import { getProductsWithLatestPrices } from "@/lib/products/get-products";

export default async function ProductsPage() {
  const products = await getProductsWithLatestPrices();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3 border-b border-dark-tremor-border pb-8">
        <span className="rounded-tremor-small bg-dark-tremor-background-subtle px-2 py-1 text-tremor-label font-medium text-dark-tremor-content-emphasis">
          Product registry
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-dark-tremor-content-strong sm:text-3xl">
          Competitor listings
        </h1>
        <p className="max-w-2xl text-tremor-default leading-6 text-dark-tremor-content">
          Paste a product link from Amazon or any supported store — we detect
          the listing details and start tracking prices automatically.
        </p>
      </header>

      <AddProductForm />
      <ProductsTable products={products} />
    </div>
  );
}
