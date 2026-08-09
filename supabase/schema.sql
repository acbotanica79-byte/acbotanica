-- AC Botânica — schema inicial
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
