import { evaluatePriceAlerts } from "@/lib/alerts/evaluate-alerts";
import { sendTriggeredAlertEmails } from "@/lib/email/send-price-alert";
import { scrapePriceFromUrl } from "@/lib/scraper/scrape-price";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CaptureResult = {
  price: number;
  rawText: string;
  record: { id: string; price: number; scraped_at: string };
  triggeredAlerts: Awaited<ReturnType<typeof evaluatePriceAlerts>>;
};

export async function captureProductPrice(
  productId: string,
  selectorOverride?: string,
): Promise<CaptureResult> {
  const supabase = createServerSupabaseClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, url, price_selector, sku")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    throw new Error("Product not found");
  }

  const resolvedSelector = selectorOverride ?? product.price_selector;
  if (!resolvedSelector) {
    throw new Error("No CSS selector configured for this product");
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
    throw new Error(insertError.message);
  }

  await supabase
    .from("products")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (!product.sku) {
    const skuMatch = product.url.match(
      /\/(?:dp|gp\/product|exec\/obidos\/ASIN)\/([A-Z0-9]{10})|\/p-(\d+)/i,
    );
    const sku = skuMatch?.[1] ?? skuMatch?.[2];
    if (sku) {
      await supabase
        .from("products")
        .update({ sku: sku.toUpperCase() })
        .eq("id", productId);
    }
  }

  const triggeredAlerts = await evaluatePriceAlerts(
    productId,
    price,
    previousRecord ? Number(previousRecord.price) : null,
  );

  if (triggeredAlerts.length > 0) {
    await sendTriggeredAlertEmails(productId, triggeredAlerts);
  }

  return {
    price,
    rawText,
    record: priceRecord,
    triggeredAlerts,
  };
}
