import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PriceAlert } from "@/types/database";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("price_alerts")
      .select("*, products(name, competitor, sku)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alerts: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type CreateAlertBody = {
  productId: string;
  alertType: PriceAlert["alert_type"];
  threshold: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAlertBody;
    const { productId, alertType, threshold } = body;

    if (!productId || !alertType || threshold == null) {
      return NextResponse.json(
        { error: "productId, alertType, and threshold are required" },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("price_alerts")
      .insert({
        product_id: productId,
        alert_type: alertType,
        threshold,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
