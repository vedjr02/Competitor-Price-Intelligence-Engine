import { AddProductForm } from "@/components/products/add-product-form";
import { ProductsTable } from "@/components/products/products-table";
import { Badge } from "@/components/ui/badge";
import { getProductsWithLatestPrices } from "@/lib/products/get-products";

export default async function ProductsPage() {
  const products = await getProductsWithLatestPrices();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Product Registry
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Competitor Listings
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Register competitor product URLs, configure CSS selectors, and trigger
          live price capture runs.
        </p>
      </header>

      <AddProductForm />
      <ProductsTable products={products} />
    </div>
  );
}
