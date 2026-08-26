-- Configurações que a Aline cadastra sozinha no painel (/admin/integracoes),
-- sem precisar mexer nas variáveis de ambiente do Vercel.
-- Seguro rodar mais de uma vez (idempotente).
create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

-- Sem nenhuma policy de propósito: só o service_role (backend, via requireAdmin())
-- consegue ler/escrever. Ninguém acessa essa tabela direto do navegador.
