import { GlassPanel } from "@/components/ui/glass-panel";

type AlertProduct = {
  name: string;
  competitor: string;
  sku: string | null;
};

type AlertRow = {
  id: string;
  alert_type: string;
  threshold: number;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  products: AlertProduct | AlertProduct[] | null;
};

type AlertsListProps = {
  alerts: AlertRow[];
};

function resolveProduct(alert: AlertRow): AlertProduct {
  if (Array.isArray(alert.products)) {
    return alert.products[0] ?? { name: "Unknown", competitor: "—", sku: null };
  }

  return alert.products ?? { name: "Unknown", competitor: "—", sku: null };
}

function formatAlertType(type: string) {
  if (type === "below") return "Price below";
  if (type === "above") return "Price above";
  return "Change %";
}

function formatThreshold(type: string, threshold: number) {
  if (type === "change_percent") return `${threshold}%`;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(threshold);
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <GlassPanel className="p-6">
      <h3 className="text-xl font-bold text-white">Active alert rules</h3>
      <p className="mt-1 text-sm text-slate-400">
        Rules evaluated automatically after each scrape run.
      </p>

      <div className="mt-6">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400">No alerts configured yet.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const product = resolveProduct(alert);

              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-white">{product.name}</p>
                      <p className="text-sm text-slate-400">
                        {product.competitor}
                        {product.sku ? ` · ${product.sku}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Rule
                        </p>
                        <p className="font-bold text-slate-200">
                          {formatAlertType(alert.alert_type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Threshold
                        </p>
                        <p className="font-bold text-slate-200">
                          {formatThreshold(
                            alert.alert_type,
                            Number(alert.threshold),
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Last triggered
                        </p>
                        <p className="font-bold text-slate-200">
                          {alert.last_triggered_at
                            ? new Intl.DateTimeFormat("en-IE", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(alert.last_triggered_at))
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
