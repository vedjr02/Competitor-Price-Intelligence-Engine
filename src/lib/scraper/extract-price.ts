import * as cheerio from "cheerio";

import { parsePrice } from "@/lib/scraper/parse-price";

function trySelectors($: cheerio.CheerioAPI, selectorString: string): string | null {
  for (const selector of selectorString.split(",").map((part) => part.trim())) {
    if (!selector) continue;

    const text = $(selector).first().text().trim();
    if (text) return text;

    const content = $(selector).first().attr("content")?.trim();
    if (content) return content;
  }

  return null;
}

function extractFromJsonLd($: cheerio.CheerioAPI): string | null {
  for (const element of $("script[type='application/ld+json']").toArray()) {
    try {
      const raw = $(element).html();
      if (!raw) continue;

      const parsed = JSON.parse(raw) as unknown;
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (!item || typeof item !== "object") continue;

        const record = item as Record<string, unknown>;
        const offers = record.offers;

        if (Array.isArray(offers)) {
          for (const offer of offers) {
            if (offer && typeof offer === "object" && "price" in offer) {
              const price = (offer as { price?: unknown }).price;
              if (price != null) return String(price);
            }
          }
        } else if (offers && typeof offers === "object" && "price" in offers) {
          const price = (offers as { price?: unknown }).price;
          if (price != null) return String(price);
        }

        if ("price" in record && record.price != null) {
          return String(record.price);
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractAmazonPrice($: cheerio.CheerioAPI): string | null {
  const amazonSelectors = [
    ".priceToPay .a-offscreen",
    ".a-price .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-offscreen",
    "#corePrice_feature_div .a-offscreen",
    "#apex_desktop .a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#twister-plus-price-data-price",
    "span[data-a-color='price'] .a-offscreen",
  ];

  for (const selector of amazonSelectors) {
    const text = $(selector).first().text().trim();
    if (text) return text;
  }

  const metaPrice = $('meta[property="product:price:amount"]').attr("content");
  if (metaPrice) return metaPrice;

  const hiddenPrice = $("input#twister-plus-price-data-price").attr("value");
  if (hiddenPrice) return hiddenPrice;

  return extractFromJsonLd($);
}

function extractGenericPrice($: cheerio.CheerioAPI): string | null {
  const metaPrice =
    $('meta[property="product:price:amount"]').attr("content") ??
    $('meta[itemprop="price"]').attr("content");

  if (metaPrice) return metaPrice;

  return extractFromJsonLd($);
}

export function extractPriceText(
  html: string,
  url: string,
  selector?: string | null,
): string | null {
  const $ = cheerio.load(html);
  const hostname = new URL(url).hostname.toLowerCase();

  if (/amazon\./i.test(hostname)) {
    const amazonPrice = extractAmazonPrice($);
    if (amazonPrice) return amazonPrice;
  }

  if (selector) {
    const selected = trySelectors($, selector);
    if (selected) return selected;
  }

  const generic = extractGenericPrice($);
  if (generic) return generic;

  return trySelectors(
    $,
    '[data-testid="product-price"], [itemprop="price"], .price, .product-price, .sale-price, [data-testid="price"]',
  );
}

export function extractPriceFromHtml(
  html: string,
  url: string,
  selector?: string | null,
): { price: number; rawText: string } {
  const rawText = extractPriceText(html, url, selector);

  if (!rawText) {
    throw new Error(
      "No price found on this page. Try scraping again — some stores block automated requests.",
    );
  }

  const price = parsePrice(rawText);
  if (price === null) {
    throw new Error(`Unable to parse price from "${rawText}"`);
  }

  return { price, rawText };
}
