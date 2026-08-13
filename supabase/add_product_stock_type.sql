-- Diferencia produtos com estoque físico próprio (baixa automática, "Esgotado" ao
-- zerar) de produtos dropshipping (sem estoque real, fornecedor comprado por pedido).
-- Seguro rodar mais de uma vez.

alter table products add column if not exists product_type text not null default 'dropshipping'
  check (product_type in ('dropshipping', 'estoque'));

alter table products add column if not exists stock_quantity int;

-- Fornecedor padrão do produto (só relevante para product_type = 'dropshipping'),
-- pré-preenche o item do pedido no checkout — mesmos campos já usados por item
-- de pedido em order_items (supplier_uf/supplier_cep/supplier_international).
alter table products add column if not exists supplier_name text;
alter table products add column if not exists supplier_uf text;
alter table products add column if not exists supplier_cep text;
alter table products add column if not exists supplier_international boolean not null default false;
