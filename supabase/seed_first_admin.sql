-- Garante que acbotanica79@gmail.com seja admin (idempotente).
-- Rode manualmente no SQL Editor do Supabase depois que essa pessoa já tiver
-- feito login pelo menos uma vez (Google ou magic link) em /conta.
insert into admin_users (id)
select id from auth.users where email = 'acbotanica79@gmail.com'
on conflict (id) do nothing;
