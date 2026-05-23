import { NextResponse } from "next/server";

import { captureProductPrice } from "@/lib/scraper/capture-product-price";
import { logScrapeRun } from "@/lib/scraper/log-scrape-run";

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

    const { price, rawText, record, triggeredAlerts } =
      await captureProductPrice(productId, selector);

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
      record,
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
