-- User profiles linked to Supabase Auth (Google login in Phase 3)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  email_alerts_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- Tie tracked listings and alert rules to a signed-in user
alter table public.products
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.price_alerts
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists price_alerts_user_id_idx on public.price_alerts (user_id);
