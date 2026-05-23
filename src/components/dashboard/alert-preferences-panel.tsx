"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";

type AlertPreferencesPanelProps = {
  productId: string | null;
  productName: string | null;
};

export function AlertPreferencesPanel({
  productId,
  productName,
}: AlertPreferencesPanelProps) {
  const router = useRouter();
  const [targetPrice, setTargetPrice] = useState("");
  const [dropPercent, setDropPercent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createAlert(
    alertType: "below" | "change_percent",
    threshold: number,
  ) {
    if (!productId) return;

    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, alertType, threshold }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Failed to save alert");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let created = 0;

      if (targetPrice.trim()) {
        await createAlert("below", Number(targetPrice));
        created += 1;
      }

      if (dropPercent.trim()) {
        await createAlert("change_percent", Number(dropPercent));
        created += 1;
      }

      if (created === 0) {
        setError("Enter a target price and/or drop % threshold.");
        return;
      }

      setTargetPrice("");
      setDropPercent("");
      setMessage(
        `Saved ${created} alert rule${created === 1 ? "" : "s"} — emails fire after the next scrape.`,
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save alerts",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel className="p-6">
      <h2 className="text-lg font-bold text-white">Alert preferences</h2>
      <p className="mt-1 text-sm text-slate-500">
        {productName
          ? `Email alerts for ${productName} when thresholds are crossed.`
          : "Select a product to configure alerts."}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Target price (€)
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={targetPrice}
            onChange={(event) => setTargetPrice(event.target.value)}
            placeholder="e.g. 89.99"
            disabled={!productId || loading}
            className="w-full rounded-xl border border-white/10 bg-[#060908] px-3 py-2.5 text-sm text-white placeholder:text-slate-600"
          />
          <span className="text-xs text-slate-600">Alert when price drops below this.</span>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Drop % threshold
          </span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={dropPercent}
            onChange={(event) => setDropPercent(event.target.value)}
            placeholder="e.g. 5"
            disabled={!productId || loading}
            className="w-full rounded-xl border border-white/10 bg-[#060908] px-3 py-2.5 text-sm text-white placeholder:text-slate-600"
          />
          <span className="text-xs text-slate-600">
            Alert when price moves by this % vs last capture.
          </span>
        </label>

        <Button
          type="submit"
          disabled={!productId || loading}
          className="w-full rounded-xl bg-emerald-500 font-bold text-[#022c22] hover:bg-emerald-400"
        >
          {loading ? "Saving…" : "Save alert rules"}
        </Button>

        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </GlassPanel>
  );
}
