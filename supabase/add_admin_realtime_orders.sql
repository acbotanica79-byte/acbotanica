-- Permite que admins (tabela admin_users) leiam TODOS os pedidos via RLS
-- (necessário para o Kanban em tempo real no navegador — a página em si já
-- usa service_role e não depende disso, mas o Supabase Realtime do lado do
-- cliente respeita RLS normalmente).
-- Seguro rodar mais de uma vez (idempotente).
drop policy if exists "admin can read all orders" on orders;
create policy "admin can read all orders"
  on orders for select
  using (exists (select 1 from admin_users where id = auth.uid()));

-- Habilita Realtime (INSERT/UPDATE/DELETE ao vivo) na tabela orders.
-- Idempotente: só adiciona à publicação se ainda não estiver nela.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table orders;
  end if;
end $$;
