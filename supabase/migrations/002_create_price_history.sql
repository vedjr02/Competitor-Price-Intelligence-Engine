-- Historical price snapshots for volatility and trend analysis
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  price numeric(12, 2) not null check (price >= 0),
  scraped_at timestamptz not null default now(),
  raw_selector text,
  created_at timestamptz not null default now()
);

create index if not exists price_history_product_scraped_idx
  on public.price_history (product_id, scraped_at desc);
