-- Testa a policy de RLS diretamente como o Postgres testaria,
-- sem passar pela API (isola se o problema é no banco ou na API).
set role anon;
insert into newsletter_subscribers (email) values ('sql-editor-test@acbotanica.com.br')
returning *;
reset role;
