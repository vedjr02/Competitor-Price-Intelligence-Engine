import { GlassPanel } from "@/components/ui/glass-panel";
import type { ScrapeHistoryEntry, ScrapeRun } from "@/types/database";

type ScrapeHistoryPanelProps = {
  history: ScrapeHistoryEntry[];
  runs: ScrapeRun[];
};

const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScrapeHistoryPanel({ history, runs }: ScrapeHistoryPanelProps) {
  return (
    <div className="space-y-6">
      <GlassPanel className="p-6">
        <h3 className="text-xl font-bold text-white">Scrape run log</h3>
        <p className="mt-1 text-sm text-slate-400">
          Batch, cron, and manual scrape executions.
        </p>

        <div className="mt-6 space-y-3">
          {runs.length === 0 ? (
            <p className="text-sm text-slate-400">No scrape runs logged yet.</p>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Type
                  </p>
                  <p className="mt-1 font-bold capitalize text-white">
                    {run.run_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Scraped
                  </p>
                  <p className="mt-1 font-bold text-emerald-300">
                    {run.products_scraped}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Failed
                  </p>
                  <p className="mt-1 font-bold text-rose-300">
                    {run.products_failed}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Started
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {formatDate(run.started_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Completed
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {run.completed_at ? formatDate(run.completed_at) : "—"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h3 className="text-xl font-bold text-white">Price capture history</h3>
        <p className="mt-1 text-sm text-slate-400">
          Individual price snapshots for the selected product.
        </p>

        <div className="mt-6 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No price captures yet.</p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-white">{entry.product_name}</p>
                  <p className="text-sm text-slate-400">
                    {entry.competitor}
                    {entry.sku ? ` · ${entry.sku}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Price
                    </p>
                    <p className="mt-1 font-bold text-white">
                      {currency.format(entry.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Captured
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {formatDate(entry.scraped_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
