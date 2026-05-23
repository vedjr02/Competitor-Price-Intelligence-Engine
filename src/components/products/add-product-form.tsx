"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <CardTitle>Track New Competitor Listing</CardTitle>
        <CardDescription>
          Paste an Amazon or shopping-site product link — we&apos;ll fill in the
          name, competitor, SKU, and price selector automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Product URL</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://www.amazon.com/dp/..."
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setPreview(null);
                }}
                required
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!url.trim() || previewing}
                onClick={handlePreview}
                className="shrink-0"
              >
                {previewing ? "Reading..." : "Preview"}
              </Button>
            </div>
          </div>

          {preview ? (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
              <p className="font-bold text-foreground">{preview.name}</p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Competitor</dt>
                  <dd>{preview.competitor}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Currency</dt>
                  <dd>{preview.currency}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">SKU / ID</dt>
                  <dd>{preview.sku ?? "Not detected"}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading || !url.trim()}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
