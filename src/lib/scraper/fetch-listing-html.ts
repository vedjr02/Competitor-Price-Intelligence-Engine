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
    "Sec-Ch-Ua": '"Chromium";v="122", "Google Chrome";v="122", "Not_A Brand";v="99"',
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
    throw new Error(
      `Could not bypass store protection (${response.status}). Try again in a moment.`,
    );
  }

  const html = await response.text();

  if (html.length < 500) {
    throw new Error("Store returned an empty page. Try again shortly.");
  }

  return html;
}

export async function fetchListingHtml(url: string): Promise<string> {
  let response: Response;

  try {
    response = await fetchDirect(url);
  } catch {
    return fetchViaJinaReader(url);
  }

  if (response.ok) {
    return response.text();
  }

  if (BLOCKED_STATUS_CODES.has(response.status)) {
    return fetchViaJinaReader(url);
  }

  throw new Error(`Could not fetch listing page (${response.status})`);
}
