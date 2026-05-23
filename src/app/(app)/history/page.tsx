import { ExportCsvButton } from "@/components/export/export-csv-button";
import { ScrapeHistoryPanel } from "@/components/history/scrape-history-panel";
import { getScrapeHistory } from "@/lib/history/get-scrape-history";

export default async function HistoryPage() {
  const { history, runs } = await getScrapeHistory(100);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 border-b border-dark-tremor-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="rounded-tremor-small bg-dark-tremor-background-subtle px-2 py-1 text-tremor-label font-medium text-dark-tremor-content-emphasis">
            Scrape history
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-dark-tremor-content-strong sm:text-3xl">
            Capture log
          </h1>
          <p className="max-w-2xl text-tremor-default leading-6 text-dark-tremor-content">
            Audit trail of scrape runs and individual price captures across all
            competitors.
          </p>
        </div>
        <ExportCsvButton />
      </header>

      <ScrapeHistoryPanel history={history} runs={runs} />
    </div>
  );
}
