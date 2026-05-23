import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEMO_PRODUCTS = [
  {
    name: "Wireless Headphones Pro",
    sku: "WH-PRO-001",
    competitor: "Amazon",
    url: "https://example.com/amazon/wh-pro",
    price_selector: '.price, [itemprop="price"]',
  },
  {
    name: "Wireless Headphones Pro",
    sku: "WH-PRO-001",
    competitor: "BestBuy",
    url: "https://example.com/bestbuy/wh-pro",
    price_selector: '.price, [itemprop="price"]',
  },
  {
    name: "Wireless Headphones Pro",
    sku: "WH-PRO-001",
    competitor: "Walmart",
    url: "https://example.com/walmart/wh-pro",
    price_selector: '.price, [itemprop="price"]',
  },
];

const DEMO_PRICES: Record<string, number[]> = {
  Amazon: [129.99, 127.5, 124.99, 121.0, 119.99, 118.5],
  BestBuy: [134.99, 132.0, 129.99, 128.5, 126.0, 125.99],
  Walmart: [122.99, 120.5, 118.99, 117.0, 115.99, 114.5],
};

const DEMO_DATES = [
  "2026-04-24",
  "2026-04-30",
  "2026-05-06",
  "2026-05-12",
  "2026-05-18",
  "2026-05-23",
];

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (existing?.length) {
      return NextResponse.json(
        { error: "Database already has products. Clear data first or add manually." },
        { status: 409 },
      );
    }

    const { data: products, error: productError } = await supabase
      .from("products")
      .insert(DEMO_PRODUCTS)
      .select("id, competitor");

    if (productError || !products?.length) {
      return NextResponse.json(
        { error: productError?.message ?? "Failed to insert products" },
        { status: 500 },
      );
    }

    const historyRows = products.flatMap((product) => {
      const prices = DEMO_PRICES[product.competitor] ?? [];
      return prices.map((price, index) => ({
        product_id: product.id,
        price,
        scraped_at: `${DEMO_DATES[index]}T12:00:00Z`,
        raw_selector: '.price, [itemprop="price"]',
      }));
    });

    const { error: historyError } = await supabase
      .from("price_history")
      .insert(historyRows);

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      products: products.length,
      snapshots: historyRows.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
