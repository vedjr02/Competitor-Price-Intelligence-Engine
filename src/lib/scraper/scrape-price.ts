import { extractPriceFromHtml } from "@/lib/scraper/extract-price";
import { fetchListingHtml } from "@/lib/scraper/fetch-listing-html";

type ScrapePriceInput = {
  url: string;
  selector: string;
};

export async function scrapePriceFromUrl({
  url,
  selector,
}: ScrapePriceInput): Promise<{ price: number; rawText: string }> {
  const html = await fetchListingHtml(url);
  return extractPriceFromHtml(html, url, selector);
}
