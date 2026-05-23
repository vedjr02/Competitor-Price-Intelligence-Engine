import { NextResponse } from "next/server";

import { evaluatePriceAlerts } from "@/lib/alerts/evaluate-alerts";
import { logScrapeRun } from "@/lib/scraper/log-scrape-run";
import { scrapePriceFromUrl } from "@/lib/scraper/scrape-price";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ScrapeRequestBody = {
  productId: string;
  selector?: string;
};

export async function POST(request: Request) {
  const startedAt = new Date().toISOString();

  try {
    const body = (await request.json()) as ScrapeRequestBody;
    const { productId, selector } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, url, price_selector")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const resolvedSelector = selector ?? product.price_selector;
    if (!resolvedSelector) {
      return NextResponse.json(
        { error: "No CSS selector configured for this product" },
        { status: 400 },
      );
    }

    const { data: previousRecord } = await supabase
      .from("price_history")
      .select("price")
      .eq("product_id", productId)
      .order("scraped_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { price, rawText } = await scrapePriceFromUrl({
      url: product.url,
      selector: resolvedSelector,
    });

    const { data: priceRecord, error: insertError } = await supabase
      .from("price_history")
      .insert({
        product_id: productId,
        price,
        raw_selector: resolvedSelector,
        scraped_at: new Date().toISOString(),
      })
      .select("id, price, scraped_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase
      .from("products")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", productId);

    const triggeredAlerts = await evaluatePriceAlerts(
      productId,
      price,
      previousRecord ? Number(previousRecord.price) : null,
    );

    await logScrapeRun({
      runType: "single",
      productsScraped: 1,
      productsFailed: 0,
      startedAt,
      details: { productId, price, alerts: triggeredAlerts.length },
    });

    return NextResponse.json({
      success: true,
      price,
      rawText,
      record: priceRecord,
      triggeredAlerts,
    });
  } catch (error) {
    await logScrapeRun({
      runType: "single",
      productsScraped: 0,
      productsFailed: 1,
      startedAt,
      details: {
        error: error instanceof Error ? error.message : "Scrape failed",
      },
    });

    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
