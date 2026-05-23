import * as cheerio from "cheerio";

import { parsePrice } from "@/lib/scraper/parse-price";

type ScrapePriceInput = {
  url: string;
  selector: string;
};

export async function scrapePriceFromUrl({
  url,
  selector,
}: ScrapePriceInput): Promise<{ price: number; rawText: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PriceIntelligenceBot/1.0; +https://github.com/vedjr02/Competitor-Price-Intelligence-Engine)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const rawText = $(selector).first().text().trim();

  if (!rawText) {
    throw new Error(`No price found for selector "${selector}" at ${url}`);
  }

  const price = parsePrice(rawText);
  if (price === null) {
    throw new Error(`Unable to parse price from "${rawText}"`);
  }

  return { price, rawText };
}
