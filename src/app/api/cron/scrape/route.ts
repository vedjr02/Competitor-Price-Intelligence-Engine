import { NextResponse } from "next/server";

import { evaluatePriceAlerts } from "@/lib/alerts/evaluate-alerts";
import { logScrapeRun } from "@/lib/scraper/log-scrape-run";
import { scrapePriceFromUrl } from "@/lib/scraper/scrape-price";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      return NextResponse.json({ message: "No products to scrape" });
    }

    let succeeded = 0;
    let failed = 0;
    let alertsTriggered = 0;

    for (const product of products) {
      try {
        const { data: previousRecord } = await supabase
          .from("price_history")
          .select("price")
          .eq("product_id", product.id)
          .order("scraped_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { price } = await scrapePriceFromUrl({
          url: product.url,
          selector: product.price_selector,
        });

        const { error: insertError } = await supabase.from("price_history").insert({
          product_id: product.id,
          price,
          raw_selector: product.price_selector,
          scraped_at: new Date().toISOString(),
        });

        if (insertError) throw new Error(insertError.message);

        await supabase
          .from("products")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", product.id);

        const triggered = await evaluatePriceAlerts(
          product.id,
          price,
          previousRecord ? Number(previousRecord.price) : null,
        );

        alertsTriggered += triggered.length;
        succeeded += 1;
      } catch {
        failed += 1;
      }
    }

    await logScrapeRun({
      runType: "cron",
      productsScraped: succeeded,
      productsFailed: failed,
      startedAt,
      details: { alertsTriggered, total: products.length },
    });

    return NextResponse.json({
      success: true,
      scraped: succeeded,
      failed,
      alertsTriggered,
    });
  } catch (error) {
    await logScrapeRun({
      runType: "cron",
      productsScraped: 0,
      productsFailed: 0,
      startedAt,
      details: {
        error: error instanceof Error ? error.message : "Cron scrape failed",
      },
    });

    const message = error instanceof Error ? error.message : "Cron scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
