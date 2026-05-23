"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ParsedListing } from "@/lib/scraper/parse-listing-from-url";

export function AddProductForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<ParsedListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePreview() {
    if (!url.trim()) return;

    setPreviewing(true);
    setError(null);
    setPreview(null);

    try {
      const response = await fetch("/api/products/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not read this listing");
      }

      setPreview(data.listing);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Could not read this listing",
      );
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create product");
      }

      setUrl("");
      setPreview(null);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel className="p-6" glow>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">Add competitor listing</h2>
        <p className="text-sm text-slate-400">
          Paste a product URL — name, competitor, SKU, and price selector are
          detected automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url" className="text-slate-300">
            Product URL
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://www.amazon.ie/dp/..."
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setPreview(null);
              }}
              required
              className="border-white/10 bg-slate-950/80 text-white placeholder:text-slate-600"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={!url.trim() || previewing}
              onClick={handlePreview}
              className="shrink-0 rounded-xl font-bold"
            >
              {previewing ? "Reading..." : "Preview"}
            </Button>
          </div>
        </div>

        {preview ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <p className="font-bold text-white">{preview.name}</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Competitor</dt>
                <dd className="text-slate-200">{preview.competitor}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Currency</dt>
                <dd className="text-slate-200">{preview.currency}</dd>
              </div>
              <div>
                <dt className="text-slate-500">SKU / ASIN</dt>
                <dd className="text-slate-200">{preview.sku ?? "Detecting on save"}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-xl font-bold"
          >
            {loading ? "Adding..." : "Add Product"}
          </Button>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        </div>
      </form>
    </GlassPanel>
  );
}
