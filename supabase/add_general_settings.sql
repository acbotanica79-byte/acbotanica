-- Configurações gerais editáveis (extensão de site_theme, criada em
-- add_site_customization.sql): contato e regra de frete grátis.
-- Seguro rodar mais de uma vez (idempotente).

alter table site_theme add column if not exists whatsapp_number text;
alter table site_theme add column if not exists phone_display text;
alter table site_theme add column if not exists contact_email text;
alter table site_theme add column if not exists free_shipping_threshold numeric;
