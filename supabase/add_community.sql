-- Comunidade de plantas: fotos + comentários. Só de plantas, sem pessoas — regra
-- aplicada por diretriz visível na página, não por moderação automática.
-- Seguro rodar mais de uma vez.

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table community_posts enable row level security;

drop policy if exists "anyone can read posts" on community_posts;
create policy "anyone can read posts"
  on community_posts for select
  using (true);

-- Sem policy de insert/update/delete para anon/authenticated — escrita só via
-- rota de servidor com service_role (mesmo padrão de newsletter/contato/produtos).

create table if not exists community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  comment text not null,
  created_at timestamptz not null default now()
);

alter table community_comments enable row level security;

drop policy if exists "anyone can read comments" on community_comments;
create policy "anyone can read comments"
  on community_comments for select
  using (true);
