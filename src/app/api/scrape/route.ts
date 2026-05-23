import { NextResponse } from "next/server";

import { scrapePriceFromUrl } from "@/lib/scraper/scrape-price";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ScrapeRequestBody = {
  productId: string;
  selector: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScrapeRequestBody;
    const { productId, selector } = body;

    if (!productId || !selector) {
      return NextResponse.json(
        { error: "productId and selector are required" },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, url")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { price, rawText } = await scrapePriceFromUrl({
      url: product.url,
      selector,
    });

    const { data: priceRecord, error: insertError } = await supabase
      .from("price_history")
      .insert({
        product_id: productId,
        price,
        raw_selector: selector,
        scraped_at: new Date().toISOString(),
      })
      .select("id, price, scraped_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      price,
      rawText,
      record: priceRecord,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
