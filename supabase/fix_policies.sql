-- Corrige as policies de RLS que permitem inserção anônima (público) nas
-- tabelas de newsletter e contato. Seguro rodar mais de uma vez.

alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

drop policy if exists "anon can subscribe" on newsletter_subscribers;
create policy "anon can subscribe"
  on newsletter_subscribers for insert
  to anon
  with check (true);

drop policy if exists "anon can send message" on contact_messages;
create policy "anon can send message"
  on contact_messages for insert
  to anon
  with check (true);

-- Confirma que as duas policies existem agora:
select tablename, policyname, roles, cmd
from pg_policies
where tablename in ('newsletter_subscribers', 'contact_messages');
