-- Causa raiz REAL do relato original ("cliente preenche os dados e não salva"):
-- a tabela profiles NUNCA EXISTIU nesse banco, apesar de estar definida em
-- supabase/schema.sql — essa parte do arquivo nunca tinha sido rodada. O painel
-- "funcionava" visualmente porque o código tem um fallback que mostra o nome
-- vindo do próprio login do Google quando não encontra a linha em profiles —
-- então parecia que tinha um cadastro, mas nunca existiu de verdade.
-- Seguro rodar mais de uma vez.

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

drop policy if exists "user can read own profile" on profiles;
create policy "user can read own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "user can update own profile" on profiles;
create policy "user can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger que cria o perfil automaticamente para cada novo cadastro em auth.users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill: cria o perfil para todo usuário que já existe em auth.users mas
-- ainda não tem linha em profiles (todo mundo, já que a tabela era nova).
insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data->>'full_name', email
from auth.users
on conflict (id) do nothing;

grant select, update on public.profiles to authenticated;
grant select, update on public.profiles to service_role;

notify pgrst, 'reload schema';

-- Confirma que a tabela existe agora e mostra quantos perfis foram criados:
select count(*) as total_perfis from public.profiles;
