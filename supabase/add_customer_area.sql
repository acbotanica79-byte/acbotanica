-- Área do Cliente: admins reais (separados de cliente comum) + endereços salvos.
-- Seguro rodar mais de uma vez (idempotente).

-- ── Admins ──────────────────────────────────────────────────
-- Antes disso, requireAdmin() só checava "existe usuário logado?" — qualquer
-- cliente comum (Google/magic link) passaria nas rotas /api/admin/**.
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- O usuário só pode checar se o PRÓPRIO id está na lista (nunca vê a lista inteira).
drop policy if exists "user can check own admin status" on admin_users;
create policy "user can check own admin status"
  on admin_users for select
  using (auth.uid() = id);

-- Sem policy de insert/update/delete para authenticated/anon de propósito:
-- só quem tem acesso ao SQL Editor (ou service_role) pode promover um admin.

-- ── Endereços salvos do cliente ─────────────────────────────
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Principal',
  recipient_name text not null,
  cep text not null,
  address text not null,
  number text,
  complement text,
  neighborhood text,
  city text not null,
  uf text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table addresses enable row level security;

drop policy if exists "user can manage own addresses" on addresses;
create policy "user can manage own addresses"
  on addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Depois de rodar este arquivo ────────────────────────────
-- Promova o(s) admin(is) atual(is) trocando o e-mail abaixo e rodando manualmente:
-- insert into admin_users (id)
-- select id from auth.users where email = 'SEU_EMAIL_ADMIN_AQUI'
-- on conflict (id) do nothing;
