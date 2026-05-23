export type Product = {
  id: string;
  name: string;
  sku: string | null;
  competitor: string;
  url: string;
  currency: string;
  price_selector: string;
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
