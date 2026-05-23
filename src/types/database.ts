export type Product = {
  id: string;
  name: string;
  sku: string | null;
  competitor: string;
  url: string;
  currency: string;
  price_selector: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceHistory = {
  id: string;
  product_id: string;
  price: number;
  scraped_at: string;
  raw_selector: string | null;
  created_at: string;
};

export type ProductWithLatestPrice = Product & {
  latest_price: number | null;
  latest_scraped_at: string | null;
};

export type AlertType = "below" | "above" | "change_percent";

export type PriceAlert = {
  id: string;
  product_id: string;
  user_id: string | null;
  alert_type: AlertType;
  threshold: number;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
};

export type ScrapeRunType = "manual" | "batch" | "cron" | "single";

export type ScrapeRun = {
  id: string;
  run_type: ScrapeRunType;
  products_scraped: number;
  products_failed: number;
  started_at: string;
  completed_at: string | null;
  details: Record<string, unknown> | null;
};

export type ScrapeHistoryEntry = {
  id: string;
  product_id: string;
  product_name: string;
  competitor: string;
  sku: string | null;
  price: number;
  scraped_at: string;
  raw_selector: string | null;
};
