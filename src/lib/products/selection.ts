import { cookies } from "next/headers";

import { getUserIdOrNull } from "@/lib/auth/get-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export const SELECTED_PRODUCT_COOKIE = "selected_product_id";

export type ProductOption = Pick<
  Product,
  "id" | "name" | "competitor" | "sku" | "currency" | "url"
>;

export type ProductCatalog = {
  products: ProductOption[];
  selectedProduct: ProductOption | null;
};

export async function getSelectedProductId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SELECTED_PRODUCT_COOKIE)?.value ?? null;
}

export async function getProductCatalog(): Promise<ProductCatalog> {
  const supabase = createServerSupabaseClient();
  const userId = await getUserIdOrNull();

  let query = supabase
    .from("products")
    .select("id, name, competitor, sku, currency, url")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: products } = await query;

  const list = products ?? [];
  const selectedId = await getSelectedProductId();
  const selectedProduct =
    list.find((product) => product.id === selectedId) ?? list[0] ?? null;

  return { products: list, selectedProduct };
}

export async function requireSelectedProduct(): Promise<ProductOption | null> {
  const { selectedProduct } = await getProductCatalog();
  return selectedProduct;
}
