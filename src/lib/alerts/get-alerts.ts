import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAlerts(productId?: string | null) {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("price_alerts")
    .select("*, products(name, competitor, sku)")
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data;
}

export async function getAlertProductOptions() {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("products")
    .select("id, name, competitor")
    .order("name");

  return data ?? [];
}
