"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";

type AddAlertFormProps = {
  products: Array<{ id: string; name: string; competitor: string }>;
  selectedProductId?: string | null;
};

export function AddAlertForm({
  products,
  selectedProductId,
}: AddAlertFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const threshold = Number(formData.get("threshold"));

    if (!Number.isFinite(threshold) || threshold < 0) {
      setError("Enter a valid threshold");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.get("productId"),
          alertType: formData.get("alertType"),
          threshold,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create alert");

      setSuccess("Alert created — it will fire after the next price capture.");
      event.currentTarget.reset();
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create alert",
      );
    } finally {
      setLoading(false);
    }
  }

  const defaultProductId = selectedProductId ?? products[0]?.id ?? "";

  return (
    <GlassPanel className="p-6" glow>
      <h3 className="text-xl font-bold text-white">Create price alert</h3>
      <p className="mt-1 text-sm text-slate-400">
        Alerts run automatically after each scrape for the selected product.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Product
          </span>
          <select
            name="productId"
            required
            defaultValue={defaultProductId}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white"
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.competitor}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Alert type
          </span>
          <select
            name="alertType"
            required
            defaultValue="below"
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white"
          >
            <option value="below">Price below (€)</option>
            <option value="above">Price above (€)</option>
            <option value="change_percent">Change % threshold</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Threshold
          </span>
          <input
            name="threshold"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="99.99"
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white"
          />
        </label>

        <div className="md:col-span-3 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={loading || products.length === 0}
            className="rounded-xl font-bold"
          >
            {loading ? "Saving..." : "Create alert"}
          </Button>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
        </div>
      </form>
    </GlassPanel>
  );
}
