alter table public.products
  add column if not exists price_selector text not null default '.price, [itemprop=\"price\"], .a-price .a-offscreen';
