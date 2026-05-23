-- Products tracked for competitor price intelligence
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  competitor text not null,
  url text not null,
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_competitor_url_idx
  on public.products (competitor, url);
