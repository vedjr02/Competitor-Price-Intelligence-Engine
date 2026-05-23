"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { classNames } from "@/lib/tremor/class-names";
import type { AlertType } from "@/types/database";

type AddAlertFormProps = {
  products: Array<{ id: string; name: string; competitor: string }>;
};

export function AddAlertForm({ products }: AddAlertFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.get("productId"),
          alertType: formData.get("alertType"),
          threshold: Number(formData.get("threshold")),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create alert");

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

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card"
    >
      <h3 className="font-medium text-dark-tremor-content-strong">
        Create price alert
      </h3>
      <p className="mt-1 text-tremor-default text-dark-tremor-content">
        Trigger when price crosses a threshold or moves by a percentage.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-tremor-label text-dark-tremor-content">Product</span>
          <select
            name="productId"
            required
            className="w-full rounded-tremor-default border border-dark-tremor-border bg-slate-950 px-3 py-2 text-tremor-default text-dark-tremor-content-strong"
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
          <span className="text-tremor-label text-dark-tremor-content">Alert type</span>
          <select
            name="alertType"
            required
            defaultValue="below"
            className="w-full rounded-tremor-default border border-dark-tremor-border bg-slate-950 px-3 py-2 text-tremor-default text-dark-tremor-content-strong"
          >
            <option value="below">Price below (€)</option>
            <option value="above">Price above (€)</option>
            <option value="change_percent">Change % threshold</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-tremor-label text-dark-tremor-content">Threshold</span>
          <input
            name="threshold"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="99.99"
            className="w-full rounded-tremor-default border border-dark-tremor-border bg-slate-950 px-3 py-2 text-tremor-default text-dark-tremor-content-strong"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || products.length === 0}
          className={classNames(
            "rounded-tremor-default bg-blue-500 px-4 py-2 text-tremor-default font-medium text-white hover:bg-blue-600",
            (loading || products.length === 0) && "opacity-60",
          )}
        >
          {loading ? "Saving..." : "Create alert"}
        </button>
        {error ? <p className="text-tremor-default text-rose-400">{error}</p> : null}
      </div>
    </form>
  );
}
