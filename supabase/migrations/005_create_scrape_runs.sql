-- Batch and scheduled scrape run audit log
create table if not exists public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null check (run_type in ('manual', 'batch', 'cron', 'single')),
  products_scraped integer not null default 0 check (products_scraped >= 0),
  products_failed integer not null default 0 check (products_failed >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  details jsonb
);

create index if not exists scrape_runs_started_at_idx
  on public.scrape_runs (started_at desc);
