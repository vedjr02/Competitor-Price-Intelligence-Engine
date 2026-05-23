import { ExportCsvButton } from "@/components/export/export-csv-button";
import { ScrapeHistoryPanel } from "@/components/history/scrape-history-panel";
import { getScrapeHistory } from "@/lib/history/get-scrape-history";
import { requireSelectedProduct } from "@/lib/products/selection";

export default async function HistoryPage() {
  const selectedProduct = await requireSelectedProduct();
  const { history, runs } = await getScrapeHistory(100, selectedProduct?.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Scrape history
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Capture log
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            {selectedProduct
              ? `Price captures for ${selectedProduct.name}.`
              : "Audit trail of scrape runs and price captures."}
          </p>
        </div>
        <ExportCsvButton />
      </header>

      <ScrapeHistoryPanel history={history} runs={runs} />
    </div>
  );
}
