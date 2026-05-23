import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AlertType, PriceAlert } from "@/types/database";

export type TriggeredAlert = PriceAlert & {
  product_name: string;
  competitor: string;
  current_price: number;
  message: string;
};

export async function evaluatePriceAlerts(
  productId: string,
  currentPrice: number,
  previousPrice: number | null,
): Promise<TriggeredAlert[]> {
  const supabase = createServerSupabaseClient();

  const { data: alerts, error } = await supabase
    .from("price_alerts")
    .select("*, products(name, competitor)")
    .eq("product_id", productId)
    .eq("is_active", true)
    .returns<
      Array<
        PriceAlert & {
          products: { name: string; competitor: string };
        }
      >
    >();

  if (error || !alerts?.length) {
    return [];
  }

  const triggered: TriggeredAlert[] = [];

  for (const alert of alerts) {
    const isTriggered = checkAlert(
      alert.alert_type,
      alert.threshold,
      currentPrice,
      previousPrice,
    );

    if (!isTriggered) continue;

    triggered.push({
      id: alert.id,
      product_id: alert.product_id,
      user_id: alert.user_id ?? null,
      alert_type: alert.alert_type,
      threshold: Number(alert.threshold),
      is_active: alert.is_active,
      last_triggered_at: alert.last_triggered_at,
      created_at: alert.created_at,
      product_name: alert.products.name,
      competitor: alert.products.competitor,
      current_price: currentPrice,
      message: buildAlertMessage(
        alert.alert_type,
        alert.threshold,
        currentPrice,
        alert.products.name,
        alert.products.competitor,
      ),
    });

    await supabase
      .from("price_alerts")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", alert.id);
  }

  return triggered;
}

function checkAlert(
  type: AlertType,
  threshold: number,
  currentPrice: number,
  previousPrice: number | null,
): boolean {
  if (type === "below") return currentPrice <= threshold;
  if (type === "above") return currentPrice >= threshold;
  if (previousPrice == null || previousPrice === 0) return false;

  const changePercent = Math.abs(
    ((currentPrice - previousPrice) / previousPrice) * 100,
  );

  return changePercent >= threshold;
}

function buildAlertMessage(
  type: AlertType,
  threshold: number,
  currentPrice: number,
  productName: string,
  competitor: string,
): string {
  const price = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(currentPrice);

  if (type === "below") {
    return `${productName} on ${competitor} dropped to ${price} (alert: below €${threshold})`;
  }
  if (type === "above") {
    return `${productName} on ${competitor} rose to ${price} (alert: above €${threshold})`;
  }

  return `${productName} on ${competitor} moved ${threshold}%+ to ${price}`;
}
