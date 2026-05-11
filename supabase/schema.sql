create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_id text not null,
  email text,
  nickname text not null,
  profile_image text,
  seed_money bigint not null default 1000000000,
  cash bigint not null default 1000000000,
  created_at timestamptz not null default now(),
  unique (provider, provider_id)
);

create table if not exists public.stocks (
  id text primary key,
  name text not null,
  market text not null default 'KOSPI',
  fallback_price bigint not null,
  previous_close bigint not null,
  image_url text,
  enabled boolean not null default true
);

create table if not exists public.latest_prices (
  stock_id text primary key references public.stocks(id) on delete cascade,
  current_price bigint not null,
  previous_close bigint not null,
  change_rate double precision not null default 0,
  volume bigint not null default 0,
  source text not null default 'seed',
  updated_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stock_id text not null references public.stocks(id),
  quantity bigint not null default 0,
  average_price bigint not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, stock_id)
);

create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stock_id text not null references public.stocks(id),
  side text not null check (side in ('BUY', 'SELL')),
  quantity bigint not null check (quantity > 0),
  price bigint not null check (price > 0),
  total_amount bigint not null,
  executed_at timestamptz not null default now()
);

create table if not exists public.kis_tokens (
  id text primary key,
  access_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

insert into public.stocks (id, name, market, fallback_price, previous_close, image_url, enabled) values
('005930', '삼성전자', 'KOSPI', 67500, 68400, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005930.png', true),
('000660', 'SK하이닉스', 'KOSPI', 114700, 112000, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/000660.png', true),
('035420', 'NAVER', 'KOSPI', 190900, 188000, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035420.png', true),
('035720', '카카오', 'KOSPI', 41700, 42100, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035720.png', true),
('005380', '현대차', 'KOSPI', 191000, 189500, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005380.png', true),
('005490', 'POSCO홀딩스', 'KOSPI', 527000, 511000, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005490.png', true),
('000080', '하이트진로', 'KOSPI', 19660, 18890, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/000080.png', true),
('015760', '한국전력', 'KOSPI', 17570, 17500, 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/015760.png', true)
on conflict (id) do update set
  name = excluded.name,
  market = excluded.market,
  fallback_price = excluded.fallback_price,
  previous_close = excluded.previous_close,
  image_url = excluded.image_url,
  enabled = excluded.enabled;

insert into public.latest_prices (stock_id, current_price, previous_close, change_rate, source) values
('005930', 67500, 68400, -0.013157894736842105, 'seed'),
('000660', 114700, 112000, 0.024107142857142858, 'seed'),
('035420', 190900, 188000, 0.015425531914893617, 'seed'),
('035720', 41700, 42100, -0.009501187648456057, 'seed'),
('005380', 191000, 189500, 0.0079155672823219, 'seed'),
('005490', 527000, 511000, 0.03131115459882583, 'seed'),
('000080', 19660, 18890, 0.04076230809952356, 'seed'),
('015760', 17570, 17500, 0.004, 'seed')
on conflict (stock_id) do nothing;

alter table public.users enable row level security;
alter table public.stocks enable row level security;
alter table public.latest_prices enable row level security;
alter table public.positions enable row level security;
alter table public.executions enable row level security;
alter table public.kis_tokens enable row level security;

drop policy if exists stocks_public_select on public.stocks;
create policy stocks_public_select on public.stocks for select to anon, authenticated using (true);

drop policy if exists latest_prices_public_select on public.latest_prices;
create policy latest_prices_public_select on public.latest_prices for select to anon, authenticated using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'latest_prices'
  ) then
    alter publication supabase_realtime add table public.latest_prices;
  end if;
end $$;
