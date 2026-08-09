-- Adiciona o link da página onde o preço de custo foi pesquisado (fornecedor/marketplace),
-- pra aparecer como hiperlink na lista de produtos do admin.
-- Seguro rodar mais de uma vez.

alter table products add column if not exists supplier_url text;
