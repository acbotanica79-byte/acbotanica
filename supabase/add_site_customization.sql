-- Personalização do site pelo painel: paleta de cores, banners da home e
-- imagem/texto do hero, tudo editável em /admin/personalizacao sem mexer
-- em código. Seguro rodar mais de uma vez (idempotente).

create table if not exists site_theme (
  id int primary key default 1,
  verde_escuro text not null default '#1b4332',
  verde_musgo text not null default '#2d6a4f',
  verde_claro text not null default '#95d5b2',
  areia text not null default '#f8f9fa',
  terracota text not null default '#c77d4a',
  dourado text not null default '#c9a66b',
  hero_image_url text,
  hero_headline text,
  hero_subheadline text,
  updated_at timestamptz not null default now(),
  constraint site_theme_singleton check (id = 1)
);

insert into site_theme (id) values (1) on conflict (id) do nothing;

alter table site_theme enable row level security;
-- Sem policy de propósito: só o service_role (admin client no servidor) lê/escreve.

create table if not exists site_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null,
  subtitle text,
  cta_label text not null default 'Ver mais',
  href text not null default '/produtos',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table site_banners enable row level security;
-- Idem: sem policy — só service_role, mesmo padrão de app_settings/products.

-- Bucket público pra imagens de banner/hero/logo enviadas pelo painel.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "public read site-media" on storage.objects;
create policy "public read site-media"
  on storage.objects for select
  using (bucket_id = 'site-media');
-- Escrita só via rota de servidor com service_role (/api/admin/upload) —
-- sem policy de insert/update/delete pra anon/authenticated.
