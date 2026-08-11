import type { Metadata } from "next";
import ProductsExplorer from "@/components/product/ProductsExplorer";
import { getProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Explore o catálogo completo da ACCFG Botânica: plantas, suculentas, cactos, vasos e artigos de jardinagem premium.",
};

export default async function ProdutosPage() {
  const products = await getProducts();
  return (
    <ProductsExplorer
      products={products}
      categories={categories}
      brands={brands}
      title="Catálogo completo"
      description="Curadoria premium de plantas, vasos e ferramentas para transformar qualquer ambiente."
    />
  );
}
