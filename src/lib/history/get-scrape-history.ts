import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ScrapeHistoryEntry } from "@/types/database";

export async function getScrapeHistory(limit = 50) {
  const supabase = createServerSupabaseClient();

  const { data: history, error: historyError } = await supabase
    .from("price_history")
    .select("id, product_id, price, scraped_at, raw_selector, products(name, competitor, sku)")
    .order("scraped_at", { ascending: false })
    .limit(limit);

  if (historyError || !history) {
    return { history: [], runs: [] };
  }

  const entries: ScrapeHistoryEntry[] = history.map((row) => ({
    id: row.id,
    product_id: row.product_id,
    product_name: row.products.name,
    competitor: row.products.competitor,
    sku: row.products.sku,
    price: Number(row.price),
    scraped_at: row.scraped_at,
    raw_selector: row.raw_selector,
  }));

  const { data: runs } = await supabase
    .from("scrape_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  return { history: entries, runs: runs ?? [] };
}
