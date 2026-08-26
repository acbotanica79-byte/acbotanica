-- Logo personalizável (extensão de site_theme, criada em add_site_customization.sql)
-- e sistema de cupons de desconto. Seguro rodar mais de uma vez (idempotente).

alter table site_theme add column if not exists logo_url text;

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  active boolean not null default true,
  min_order_value numeric not null default 0,
  usage_limit int,
  times_used int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table coupons enable row level security;
-- Sem policy de propósito: só o service_role (admin client no servidor) lê/escreve —
-- mesmo padrão de app_settings/site_theme/site_banners.

alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount numeric not null default 0;
