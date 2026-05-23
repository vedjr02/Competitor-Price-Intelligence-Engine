import { AddAlertForm } from "@/components/alerts/add-alert-form";
import { AlertsList } from "@/components/alerts/alerts-list";
import {
  getAlertProductOptions,
  getAlerts,
} from "@/lib/alerts/get-alerts";

export default async function AlertsPage() {
  const [alerts, products] = await Promise.all([
    getAlerts(),
    getAlertProductOptions(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3 border-b border-dark-tremor-border pb-8">
        <span className="rounded-tremor-small bg-dark-tremor-background-subtle px-2 py-1 text-tremor-label font-medium text-dark-tremor-content-emphasis">
          Price alerts
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-dark-tremor-content-strong sm:text-3xl">
          Alert rules
        </h1>
        <p className="max-w-2xl text-tremor-default leading-6 text-dark-tremor-content">
          Set thresholds for price drops, spikes, or percentage moves. Alerts
          fire automatically after each scrape.
        </p>
      </header>

      <AddAlertForm products={products} />
      <AlertsList alerts={alerts} />
    </div>
  );
}
