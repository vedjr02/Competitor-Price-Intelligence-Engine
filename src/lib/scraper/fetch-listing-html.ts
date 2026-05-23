const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const BLOCKED_STATUS_CODES = new Set([401, 403, 429, 503]);

function buildBrowserHeaders(url: string): HeadersInit {
  const origin = new URL(url).origin;

  return {
    "User-Agent": USER_AGENT,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IE,en;q=0.9,en-US;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: `${origin}/`,
    "Sec-Ch-Ua":
      '"Chromium";v="122", "Google Chrome";v="122", "Not_A Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  };
}

async function fetchDirect(url: string): Promise<Response> {
  return fetch(url, {
    headers: buildBrowserHeaders(url),
    redirect: "follow",
    next: { revalidate: 0 },
  });
}

async function fetchViaJinaReader(url: string): Promise<string> {
  const readerUrl = `https://r.jina.ai/${url}`;
  const headers: HeadersInit = {
    Accept: "text/html",
    "X-Return-Format": "html",
    "User-Agent": USER_AGENT,
  };

  const apiKey = process.env.JINA_API_KEY?.trim();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(readerUrl, {
    headers,
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Jina reader failed (${response.status})`);
  }

  const html = await response.text();
  if (html.length < 500) {
    throw new Error("Jina reader returned an empty page");
  }

  return html;
}

async function fetchViaScraperApi(url: string): Promise<string> {
  const apiKey = process.env.SCRAPERAPI_KEY?.trim();
  if (!apiKey) {
    throw new Error("ScraperAPI key not configured");
  }

  const renderJs = process.env.SCRAPERAPI_RENDER === "true" ? "&render=true" : "";
  const endpoint = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(url)}${renderJs}`;

  const response = await fetch(endpoint, { next: { revalidate: 0 } });

  if (!response.ok) {
    throw new Error(`ScraperAPI failed (${response.status})`);
  }

  const html = await response.text();
  if (html.length < 500) {
    throw new Error("ScraperAPI returned an empty page");
  }

  return html;
}

/**
 * Fetches listing HTML using a provider chain:
 * 1. Direct browser-like request (fast, free)
 * 2. Jina Reader (Cloudflare bypass for many stores)
 * 3. ScraperAPI (paid, most reliable — set SCRAPERAPI_KEY)
 */
export async function fetchListingHtml(url: string): Promise<string> {
  let blocked = false;

  try {
    const response = await fetchDirect(url);

    if (response.ok) {
      return response.text();
    }

    if (BLOCKED_STATUS_CODES.has(response.status)) {
      blocked = true;
    } else {
      throw new Error(`Could not fetch listing page (${response.status})`);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Could not fetch listing page")
    ) {
      throw error;
    }
    blocked = true;
  }

  const errors: string[] = [];

  if (blocked) {
    try {
      return await fetchViaJinaReader(url);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Jina reader unavailable",
      );
    }

    try {
      return await fetchViaScraperApi(url);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "ScraperAPI unavailable",
      );
    }
  }

  throw new Error(
    errors.length > 0
      ? `All fetch providers failed: ${errors.join("; ")}`
      : "Could not fetch listing page",
  );
}
