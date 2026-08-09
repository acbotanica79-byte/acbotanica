-- Diagnóstico completo: mostra o texto exato da condição da policy,
-- se RLS está realmente ligado, e se existe mais de uma tabela com esse nome
-- em schemas diferentes (o que faria o INSERT cair no lugar errado).

select n.nspname as schema, c.relname as tabela,
       c.relrowsecurity as rls_ligado,
       c.relforcerowsecurity as rls_forcado_no_dono
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relname in ('newsletter_subscribers', 'contact_messages');

select schemaname, tablename, policyname, permissive, roles, cmd,
       qual as condicao_using,
       with_check as condicao_with_check
from pg_policies
where tablename in ('newsletter_subscribers', 'contact_messages');

show search_path;
