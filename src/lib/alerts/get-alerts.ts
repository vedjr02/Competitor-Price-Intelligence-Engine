import { getUserIdOrNull } from "@/lib/auth/get-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAlerts(productId?: string | null) {
  const supabase = createServerSupabaseClient();
  const userId = await getUserIdOrNull();

  let query = supabase
    .from("price_alerts")
    .select("*, products(name, competitor, sku)")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data;
}

export async function getAlertProductOptions() {
  const supabase = createServerSupabaseClient();
  const userId = await getUserIdOrNull();

  let query = supabase
    .from("products")
    .select("id, name, competitor")
    .order("name");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;

  return data ?? [];
}
