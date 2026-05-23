import { AddAlertForm } from "@/components/alerts/add-alert-form";
import { AlertsList } from "@/components/alerts/alerts-list";
import { getAlerts, getAlertProductOptions } from "@/lib/alerts/get-alerts";
import { requireSelectedProduct } from "@/lib/products/selection";

export default async function AlertsPage() {
  const selectedProduct = await requireSelectedProduct();
  const [alerts, products] = await Promise.all([
    getAlerts(selectedProduct?.id),
    getAlertProductOptions(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Price alerts
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Alert rules
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          {selectedProduct
            ? `Showing alerts for ${selectedProduct.name}. Switch products from the sidebar to view others.`
            : "Set thresholds for price drops, spikes, or percentage moves."}
        </p>
      </header>

      <AddAlertForm
        products={products}
        selectedProductId={selectedProduct?.id}
      />
      <AlertsList alerts={alerts} />
    </div>
  );
}
