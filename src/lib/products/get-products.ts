import { getUserIdOrNull } from "@/lib/auth/get-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductWithLatestPrice } from "@/types/database";

export async function getProductsWithLatestPrices(): Promise<
  ProductWithLatestPrice[]
> {
  const supabase = createServerSupabaseClient();
  const userId = await getUserIdOrNull();

  let query = supabase.from("products").select("*").order("updated_at", {
    ascending: false,
  });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: products, error } = await query;

  if (error || !products?.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);

  const { data: history } = await supabase
    .from("price_history")
    .select("product_id, price, scraped_at")
    .in("product_id", productIds)
    .order("scraped_at", { ascending: false });

  const latestByProduct = new Map<
    string,
    { price: number; scraped_at: string }
  >();

  for (const entry of history ?? []) {
    if (!latestByProduct.has(entry.product_id)) {
      latestByProduct.set(entry.product_id, {
        price: Number(entry.price),
        scraped_at: entry.scraped_at,
      });
    }
  }

  return products.map((product) => {
    const latest = latestByProduct.get(product.id);
    return {
      ...product,
      latest_price: latest?.price ?? null,
      latest_scraped_at: latest?.scraped_at ?? null,
    };
  });
}
