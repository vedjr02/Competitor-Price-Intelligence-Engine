import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-session";
import { SELECTED_PRODUCT_COOKIE } from "@/lib/products/selection";
import { captureProductPrice } from "@/lib/scraper/capture-product-price";
import { logScrapeRun } from "@/lib/scraper/log-scrape-run";
import { parseListingFromUrl } from "@/lib/scraper/parse-listing-from-url";
import { createAuthSupabaseClient } from "@/lib/supabase/server-auth";
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const supabase = await createAuthSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: listing.name,
        competitor: listing.competitor,
        url: listing.url,
        sku: listing.sku,
        currency: listing.currency,
        price_selector: listing.price_selector,
        user_id: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let initialPrice: number | null = null;
    let scrapeError: string | null = null;

    try {
      const capture = await captureProductPrice(data.id, undefined, supabase);
      initialPrice = capture.price;
      await logScrapeRun({
        runType: "single",
        productsScraped: 1,
        productsFailed: 0,
        startedAt: new Date().toISOString(),
        details: { productId: data.id, price: capture.price, onCreate: true },
      });
    } catch (captureError) {
      scrapeError =
        captureError instanceof Error
          ? captureError.message
          : "Initial price capture failed";
      try {
        await logScrapeRun({
          runType: "single",
          productsScraped: 0,
          productsFailed: 1,
          startedAt: new Date().toISOString(),
          details: { productId: data.id, onCreate: true, error: scrapeError },
        });
      } catch {
        // Scrape logging is optional when service role key is unavailable.
      }
    }

    const response = NextResponse.json(
      { product: data, initialPrice, scrapeError },
      { status: 201 },
    );
    response.cookies.set(SELECTED_PRODUCT_COOKIE, data.id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const supabase = await createAuthSupabaseClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
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
