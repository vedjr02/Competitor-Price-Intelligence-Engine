import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function escapeCsv(value: string | number | null) {
  if (value == null) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("price_history")
      .select(
        "price, scraped_at, raw_selector, products(name, sku, competitor, url, currency)",
      )
      .order("scraped_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const headers = [
      "product_name",
      "sku",
      "competitor",
      "url",
      "currency",
      "price",
      "scraped_at",
      "selector",
    ];

    const rows = (data ?? []).map((row) =>
      [
        escapeCsv(row.products.name),
        escapeCsv(row.products.sku),
        escapeCsv(row.products.competitor),
        escapeCsv(row.products.url),
        escapeCsv(row.products.currency),
        escapeCsv(row.price),
        escapeCsv(row.scraped_at),
        escapeCsv(row.raw_selector),
      ].join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const filename = `price-intelligence-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
