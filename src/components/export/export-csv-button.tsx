"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { classNames } from "@/lib/tremor/class-names";

export function ExportCsvButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    try {
      const response = await fetch("/api/export/csv");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `price-intelligence-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className={classNames(
        "inline-flex items-center gap-2 rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background px-3 py-2 text-tremor-default font-medium text-dark-tremor-content-strong transition-colors hover:bg-dark-tremor-background-subtle",
        loading && "opacity-60",
      )}
    >
      <Download className="size-4" />
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
}
