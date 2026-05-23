import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ScrapeRunType } from "@/types/database";

type LogScrapeRunInput = {
  runType: ScrapeRunType;
  productsScraped: number;
  productsFailed: number;
  startedAt: string;
  details?: Record<string, unknown>;
};

export async function logScrapeRun(input: LogScrapeRunInput) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("scrape_runs")
    .insert({
      run_type: input.runType,
      products_scraped: input.productsScraped,
      products_failed: input.productsFailed,
      started_at: input.startedAt,
      completed_at: new Date().toISOString(),
      details: input.details ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to log scrape run:", error.message);
    return null;
  }

  return data;
}
