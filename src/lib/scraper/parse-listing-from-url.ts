import * as cheerio from "cheerio";

import { fetchListingHtml } from "@/lib/scraper/fetch-listing-html";

export type ParsedListing = {
  name: string;
  competitor: string;
  url: string;
  sku: string | null;
  currency: string;
  price_selector: string;
};

type SiteRule = {
  competitor: string;
  priceSelector: string;
  defaultCurrency: string;
  nameSelectors: string[];
  skuFromUrl?: RegExp;
};

const SITE_RULES: Array<{ match: RegExp; rule: SiteRule }> = [
  {
    match: /amazon\./i,
    rule: {
      competitor: "Amazon",
      priceSelector: ".a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice",
      defaultCurrency: "EUR",
      nameSelectors: ["#productTitle", "meta[property='og:title']", "title"],
      skuFromUrl: /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i,
    },
  },
  {
    match: /ebay\./i,
    rule: {
      competitor: "eBay",
      priceSelector: ".x-price-primary, [itemprop='price'], .display-price",
      defaultCurrency: "EUR",
      nameSelectors: ["h1.x-item-title__mainTitle", "meta[property='og:title']", "h1", "title"],
      skuFromUrl: /\/itm\/(\d+)/i,
    },
  },
  {
    match: /walmart\./i,
    rule: {
      competitor: "Walmart",
      priceSelector: "[itemprop='price'], [data-testid='price-wrap'] span",
      defaultCurrency: "USD",
      nameSelectors: ["h1", "meta[property='og:title']", "title"],
    },
  },
  {
    match: /bestbuy\./i,
    rule: {
      competitor: "Best Buy",
      priceSelector: ".priceView-customer-price span, [data-testid='customer-price']",
      defaultCurrency: "USD",
      nameSelectors: ["h1", "meta[property='og:title']", "title"],
      skuFromUrl: /skuId=(\d+)/i,
    },
  },
  {
    match: /currys\./i,
    rule: {
      competitor: "Currys",
      priceSelector: ".price, [itemprop='price']",
      defaultCurrency: "GBP",
      nameSelectors: ["h1", "meta[property='og:title']", "title"],
    },
  },
  {
    match: /argos\./i,
    rule: {
      competitor: "Argos",
      priceSelector: "[data-test='product-price'], [itemprop='price']",
      defaultCurrency: "GBP",
      nameSelectors: ["h1", "meta[property='og:title']", "title"],
    },
  },
  {
    match: /apple\./i,
    rule: {
      competitor: "Apple",
      priceSelector: ".rc-prices-fullprice, [data-autom='price']",
      defaultCurrency: "EUR",
      nameSelectors: ["h1", "meta[property='og:title']", "title"],
    },
  },
];

const TLD_CURRENCY: Record<string, string> = {
  uk: "GBP",
  ie: "EUR",
  de: "EUR",
  fr: "EUR",
  it: "EUR",
  es: "EUR",
  nl: "EUR",
  com: "USD",
  ca: "CAD",
  au: "AUD",
};

function getSiteRule(hostname: string): SiteRule {
  const matched = SITE_RULES.find(({ match }) => match.test(hostname));
  if (matched) return matched.rule;

  const brand = hostname.replace(/^www\./, "").split(".")[0];
  return {
    competitor: brand.charAt(0).toUpperCase() + brand.slice(1),
    priceSelector: '[itemprop="price"], .price, .product-price, .sale-price',
    defaultCurrency: "EUR",
    nameSelectors: ["meta[property='og:title']", "h1", "title"],
  };
}

function inferCurrency(hostname: string, $: cheerio.CheerioAPI, fallback: string) {
  const metaCurrency =
    $('meta[property="product:price:currency"]').attr("content") ??
    $('meta[itemprop="priceCurrency"]').attr("content");

  if (metaCurrency) return metaCurrency.toUpperCase();

  const tld = hostname.split(".").pop()?.toLowerCase() ?? "";
  return TLD_CURRENCY[tld] ?? fallback;
}

function extractText($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    if (selector.startsWith("meta")) {
      const content = $(selector).attr("content")?.trim();
      if (content) return cleanTitle(content);
      continue;
    }

    const text = $(selector).first().text().trim();
    if (text) return cleanTitle(text);
  }

  return null;
}

function cleanTitle(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*[|\-–—]\s*Amazon.*$/i, "")
    .replace(/\s*[|\-–—]\s*eBay.*$/i, "")
    .trim();
}

function extractSku(url: string, rule: SiteRule) {
  if (rule.skuFromUrl) {
    const match = url.match(rule.skuFromUrl);
    if (match?.[1]) return match[1].toUpperCase();
  }

  return null;
}

export async function parseListingFromUrl(rawUrl: string): Promise<ParsedListing> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch {
    throw new Error("Please paste a valid product URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("URL must start with http:// or https://");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const rule = getSiteRule(hostname);
  const html = await fetchListingHtml(parsedUrl.toString());
  const $ = cheerio.load(html);

  const name = extractText($, rule.nameSelectors);
  if (!name) {
    throw new Error("Could not detect product name from this page");
  }

  const currency = inferCurrency(hostname, $, rule.defaultCurrency);
  const sku = extractSku(parsedUrl.toString(), rule);

  return {
    name,
    competitor: rule.competitor,
    url: parsedUrl.toString(),
    sku,
    currency,
    price_selector: rule.priceSelector,
  };
}
