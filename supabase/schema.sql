-- ACCFG Botânica — schema inicial
-- Rode este arquivo no SQL Editor do seu projeto Supabase (dashboard > SQL Editor > New query).
-- Seguro para rodar mais de uma vez (idempotente).

create extension if not exists pgcrypto;

-- ── Newsletter ──────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

drop policy if exists "anon can subscribe" on newsletter_subscribers;
create policy "anon can subscribe"
  on newsletter_subscribers for insert
  to anon
  with check (true);

-- ── Contato ─────────────────────────────────────────────────
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

alter table contact_messages enable row level security;

drop policy if exists "anon can send message" on contact_messages;
create policy "anon can send message"
  on contact_messages for insert
  to anon
  with check (true);

-- Leitura/edição de contact_messages e newsletter_subscribers fica só para
-- service_role (painel admin), por isso não há policy de select/update para
-- "anon" — a RLS bloqueia por padrão quando não existe policy permitindo.

-- ── Produtos ────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  short_description text not null,
  images text[] not null default '{}',
  photo_note text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  cost_price numeric(10,2),
  brand_slug text,
  category_slug text not null,
  subcategory text,
  tags text[] not null default '{}',
  weight_grams int,
  dimensions jsonb,
  material text,
  color text,
  environments text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  reviews jsonb not null default '[]',
  qa jsonb not null default '[]',
  related_slugs text[] not null default '{}',
  featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products enable row level security;

drop policy if exists "anyone can read products" on products;
create policy "anyone can read products"
  on products for select
  to anon
  using (true);

-- Escrita (insert/update/delete) só via service_role, no painel admin.
-- Não existe policy de insert/update/delete para "anon" de propósito.

-- ── Pedidos ─────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default to_char(now(), 'YYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6),
  status text not null default 'aguardando_pagamento' check (status in ('aguardando_pagamento', 'novo', 'comprado', 'enviado', 'entregue', 'cancelado')),
  payment_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_cep text not null,
  shipping_address text not null,
  shipping_number text,
  shipping_complement text,
  shipping_neighborhood text,
  shipping_city text not null,
  shipping_uf text not null,
  shipping_price numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  notes text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders enable row level security;

-- Cliente pode ler os seus próprios pedidos
drop policy if exists "user can read own orders" on orders;
create policy "user can read own orders"
  on orders for select
  using (auth.uid() = user_id);

-- Sem policies para "anon" — nem insert, nem select. O checkout cria o
-- pedido via rota de servidor com service_role (mesmo padrão de
-- newsletter/contato), e só o painel admin lê pedidos.

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  product_slug text not null,
  unit_price numeric(10,2) not null,
  quantity int not null,
  supplier_name text,
  supplier_cost numeric(10,2),
  created_at timestamptz not null default now()
);

alter table order_items enable row level security;
-- Mesma lógica: sem policies para "anon", acesso só via service_role.

-- ── Perfis (Área do Cliente LGPD) ───────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  cpf text,
  phone text,
  accepted_terms boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- O usuário só pode ver o próprio perfil
drop policy if exists "user can read own profile" on profiles;
create policy "user can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- O usuário só pode atualizar o próprio perfil
drop policy if exists "user can update own profile" on profiles;
create policy "user can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger para criar o perfil automaticamente no cadastro da auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
