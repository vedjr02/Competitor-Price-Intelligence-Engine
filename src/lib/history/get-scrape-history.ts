import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ScrapeHistoryEntry } from "@/types/database";

export async function getScrapeHistory(limit = 50, productId?: string | null) {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("price_history")
    .select("id, product_id, price, scraped_at, raw_selector, products(name, competitor, sku)")
    .order("scraped_at", { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data: history, error: historyError } = await query;

  if (historyError || !history) {
    return { history: [], runs: [] };
  }

  const entries: ScrapeHistoryEntry[] = history.map((row) => {
    const product = row.products as unknown as {
      name: string;
      competitor: string;
      sku: string | null;
    };

    return {
      id: row.id,
      product_id: row.product_id,
      product_name: product.name,
      competitor: product.competitor,
      sku: product.sku,
      price: Number(row.price),
      scraped_at: row.scraped_at,
      raw_selector: row.raw_selector,
    };
  });

  const { data: runs } = await supabase
    .from("scrape_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  return { history: entries, runs: runs ?? [] };
}
