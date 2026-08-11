-- Corrige a tabela orders que já existia sem a coluna user_id
-- (create table if not exists não adiciona coluna nova em tabela já criada).
-- Seguro rodar mais de uma vez.

alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table orders enable row level security;

drop policy if exists "user can read own orders" on orders;
create policy "user can read own orders"
  on orders for select
  using (auth.uid() = user_id);
