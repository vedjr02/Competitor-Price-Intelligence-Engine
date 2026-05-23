import { NextResponse } from "next/server";

import { parseListingFromUrl } from "@/lib/scraper/parse-listing-from-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

type CreateProductBody = {
  url: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProductBody;

    if (!body.url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const listing = await parseListingFromUrl(body.url);
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: listing.name,
        competitor: listing.competitor,
        url: listing.url,
        sku: listing.sku,
        currency: listing.currency,
        price_selector: listing.price_selector,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false })
      .returns<Product[]>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const productIds = (products ?? []).map((product) => product.id);

    if (productIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const { data: history, error: historyError } = await supabase
      .from("price_history")
      .select("product_id, price, scraped_at")
      .in("product_id", productIds)
      .order("scraped_at", { ascending: false });

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    const latestByProduct = new Map<
      string,
      { price: number; scraped_at: string }
    >();

    for (const entry of history ?? []) {
      if (!latestByProduct.has(entry.product_id)) {
        latestByProduct.set(entry.product_id, {
          price: Number(entry.price),
          scraped_at: entry.scraped_at,
        });
      }
    }

    const enriched = (products ?? []).map((product) => {
      const latest = latestByProduct.get(product.id);
      return {
        ...product,
        latest_price: latest?.price ?? null,
        latest_scraped_at: latest?.scraped_at ?? null,
      };
    });

    return NextResponse.json({ products: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
