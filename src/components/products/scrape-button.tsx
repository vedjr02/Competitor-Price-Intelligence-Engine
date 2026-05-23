"use client";

import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const [isError, setIsError] = useState(false);

  async function handleScrape() {
    setLoading(true);
    setMessage(null);
    setIsError(false);

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
        setMessage(`Captured ${Number(data.price).toFixed(2)}`);
      } else {
        const failures = (data.results ?? []).filter(
          (result: { success: boolean }) => !result.success,
        );

        if (data.scraped === 0 && failures.length > 0) {
          setIsError(true);
          setMessage(
            failures[0]?.error ??
              `0/${data.total} updated — all scrapes failed`,
          );
        } else {
          setMessage(`${data.scraped}/${data.total} products updated`);
        }
      }

      router.refresh();
    } catch (error) {
      setIsError(true);
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
        className="rounded-xl font-bold bg-emerald-500 text-[#022c22] hover:bg-emerald-400"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {label ?? (productId ? "Scrape" : "Scrape All")}
      </Button>
      {message ? (
        <span
          className={`max-w-56 text-xs ${isError ? "text-rose-400" : "text-slate-400"}`}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Remove "${productName}" from tracking? This deletes its price history and alerts.`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Delete failed");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="rounded-xl border-rose-400/20 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      Remove
    </Button>
  );
}
