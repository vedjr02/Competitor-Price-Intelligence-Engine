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

export function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          competitor: formData.get("competitor"),
          url: formData.get("url"),
          sku: formData.get("sku") || undefined,
          currency: formData.get("currency") || "EUR",
          price_selector: formData.get("price_selector") || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create product");
      }

      event.currentTarget.reset();
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
          Add a product URL and CSS selector to begin live price intelligence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" name="name" placeholder="Sony WH-1000XM5" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="competitor">Competitor</Label>
            <Input id="competitor" name="competitor" placeholder="Amazon" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="url">Listing URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://competitor.com/product/..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (optional)</Label>
            <Input id="sku" name="sku" placeholder="WH1000XM5-BLK" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue="EUR" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="price_selector">CSS price selector</Label>
            <Input
              id="price_selector"
              name="price_selector"
              defaultValue='.price, [itemprop="price"], .a-price .a-offscreen'
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
