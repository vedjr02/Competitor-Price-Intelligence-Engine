"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type ScrapeButtonProps = {
  productId?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm";
};

export function ScrapeButton({
  productId,
  label,
  variant = "outline",
  size = "sm",
}: ScrapeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleScrape() {
    setLoading(true);
    setMessage(null);

    try {
      const endpoint = productId ? "/api/scrape" : "/api/scrape/batch";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: productId ? JSON.stringify({ productId }) : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Scrape failed");
      }

      if (productId) {
        setMessage(`€${Number(data.price).toFixed(2)} captured`);
      } else {
        setMessage(`${data.scraped}/${data.total} products updated`);
      }

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Scrape failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={loading}
        onClick={handleScrape}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {label ?? (productId ? "Scrape" : "Scrape All")}
      </Button>
      {message ? (
        <span className="max-w-48 text-xs text-muted-foreground">{message}</span>
      ) : null}
    </div>
  );
}
