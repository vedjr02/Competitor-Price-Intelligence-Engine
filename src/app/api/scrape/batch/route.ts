import { NextResponse } from "next/server";

import { evaluatePriceAlerts } from "@/lib/alerts/evaluate-alerts";
import { logScrapeRun } from "@/lib/scraper/log-scrape-run";
import { scrapePriceFromUrl } from "@/lib/scraper/scrape-price";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const startedAt = new Date().toISOString();

  try {
    const supabase = createServerSupabaseClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("id, url, price_selector, name, competitor");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!products?.length) {
      return NextResponse.json({ error: "No products to scrape" }, { status: 404 });
    }

    const results = [];
    const allTriggeredAlerts = [];

    for (const product of products) {
      try {
        const { data: previousRecord } = await supabase
          .from("price_history")
          .select("price")
          .eq("product_id", product.id)
          .order("scraped_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { price, rawText } = await scrapePriceFromUrl({
          url: product.url,
          selector: product.price_selector,
        });

        const { data: record, error: insertError } = await supabase
          .from("price_history")
          .insert({
            product_id: product.id,
            price,
            raw_selector: product.price_selector,
            scraped_at: new Date().toISOString(),
          })
          .select("id, price, scraped_at")
          .single();

        if (insertError) throw new Error(insertError.message);

        await supabase
          .from("products")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", product.id);

        const triggeredAlerts = await evaluatePriceAlerts(
          product.id,
          price,
          previousRecord ? Number(previousRecord.price) : null,
        );

        allTriggeredAlerts.push(...triggeredAlerts);

        results.push({
          productId: product.id,
          name: product.name,
          competitor: product.competitor,
          success: true,
          price,
          rawText,
          record,
          triggeredAlerts,
        });
      } catch (scrapeError) {
        results.push({
          productId: product.id,
          name: product.name,
          competitor: product.competitor,
          success: false,
          error:
            scrapeError instanceof Error
              ? scrapeError.message
              : "Scrape failed",
        });
      }
    }

    const succeeded = results.filter((result) => result.success).length;
    const failed = results.length - succeeded;

    await logScrapeRun({
      runType: "batch",
      productsScraped: succeeded,
      productsFailed: failed,
      startedAt,
      details: {
        total: products.length,
        alertsTriggered: allTriggeredAlerts.length,
        results,
      },
    });

    return NextResponse.json({
      success: succeeded > 0,
      scraped: succeeded,
      total: products.length,
      triggeredAlerts: allTriggeredAlerts,
      results,
    });
  } catch (error) {
    await logScrapeRun({
      runType: "batch",
      productsScraped: 0,
      productsFailed: 0,
      startedAt,
      details: {
        error: error instanceof Error ? error.message : "Batch scrape failed",
      },
    });

    const message = error instanceof Error ? error.message : "Batch scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
