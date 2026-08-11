-- Origem do fornecedor por item de pedido, pra calcular o frete real
-- (fornecedor -> cliente) e mostrar a comissão de verdade no painel.
-- Seguro rodar mais de uma vez.

alter table order_items add column if not exists supplier_uf text;
alter table order_items add column if not exists supplier_cep text;
alter table order_items add column if not exists supplier_international boolean not null default false;
