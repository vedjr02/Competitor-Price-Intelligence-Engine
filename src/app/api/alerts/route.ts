import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-session";
import { createAuthSupabaseClient } from "@/lib/supabase/server-auth";
import type { PriceAlert } from "@/types/database";

function formatAlertsError(message: string) {
  if (
    message.includes("price_alerts") &&
    (message.includes("does not exist") || message.includes("Could not find"))
  ) {
    return "Alerts table missing. Run supabase/migrations/004_create_price_alerts.sql in your Supabase SQL editor.";
  }

  return message;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const supabase = await createAuthSupabaseClient();

    const { data, error } = await supabase
      .from("price_alerts")
      .select("*, products(name, competitor, sku)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: formatAlertsError(error.message) },
        { status: 500 },
      );
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

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const supabase = await createAuthSupabaseClient();

    const { data, error } = await supabase
      .from("price_alerts")
      .insert({
        product_id: productId,
        user_id: user.id,
        alert_type: alertType,
        threshold,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: formatAlertsError(error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json({ alert: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
