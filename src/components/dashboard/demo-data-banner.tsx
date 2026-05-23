"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { classNames } from "@/lib/tremor/class-names";

export function DemoDataBanner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSampleData() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/seed/demo", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Seed failed");

      setMessage(`Loaded ${data.products} products and ${data.snapshots} price snapshots.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Seed failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-tremor-default border border-blue-500/30 bg-blue-500/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-tremor-default font-medium text-blue-300">
            Demo mode — sample Tremor charts
          </p>
          <p className="text-tremor-label text-dark-tremor-content">
            Your database is empty. Charts below use sample data. Load real demo
            products into Supabase to replace this.
          </p>
          {message ? (
            <p className="mt-1 text-tremor-label text-dark-tremor-content-emphasis">
              {message}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={loadSampleData}
          disabled={loading}
          className={classNames(
            "shrink-0 rounded-tremor-default bg-blue-500 px-4 py-2 text-tremor-default font-medium text-white hover:bg-blue-600",
            loading && "opacity-60",
          )}
        >
          {loading ? "Loading..." : "Load sample data"}
        </button>
      </div>
    </div>
  );
}
