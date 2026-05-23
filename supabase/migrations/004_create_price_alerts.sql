-- Price alert rules for competitor listings
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  alert_type text not null check (alert_type in ('below', 'above', 'change_percent')),
  threshold numeric(12, 2) not null check (threshold >= 0),
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists price_alerts_product_active_idx
  on public.price_alerts (product_id, is_active);
