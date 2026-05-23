import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ScrapeHistoryEntry } from "@/types/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? 50);

    const supabase = createServerSupabaseClient();

    const { data: history, error: historyError } = await supabase
      .from("price_history")
      .select("id, product_id, price, scraped_at, raw_selector, products(name, competitor, sku)")
      .order("scraped_at", { ascending: false })
      .limit(Math.min(limit, 200));

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    const entries: ScrapeHistoryEntry[] = (history ?? []).map((row) => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.products.name,
      competitor: row.products.competitor,
      sku: row.products.sku,
      price: Number(row.price),
      scraped_at: row.scraped_at,
      raw_selector: row.raw_selector,
    }));

    const { data: runs, error: runsError } = await supabase
      .from("scrape_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(20);

    if (runsError) {
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }

    return NextResponse.json({
      history: entries,
      runs: runs ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
