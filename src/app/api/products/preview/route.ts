import { NextResponse } from "next/server";

import { parseListingFromUrl } from "@/lib/scraper/parse-listing-from-url";

type PreviewBody = {
  url: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewBody;

    if (!body.url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const listing = await parseListingFromUrl(body.url);
    return NextResponse.json({ listing });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not parse listing";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
