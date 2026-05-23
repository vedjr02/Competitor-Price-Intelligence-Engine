import { NextResponse } from "next/server";

import {
  SELECTED_PRODUCT_COOKIE,
} from "@/lib/products/selection";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SelectBody = {
  productId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SelectBody;

    if (!body.productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("id")
      .eq("id", body.productId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, productId: body.productId });
    response.cookies.set(SELECTED_PRODUCT_COOKIE, body.productId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Selection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
