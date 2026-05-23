import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAlerts() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("price_alerts")
    .select("*, products(name, competitor, sku)")
    .order("created_at", { ascending: false });

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
