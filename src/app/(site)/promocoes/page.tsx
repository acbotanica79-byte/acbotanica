import type { Metadata } from "next";
import ProductsExplorer from "@/components/product/ProductsExplorer";
import { getProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "Promoções",
  description: "Aproveite os produtos com desconto especial da ACCFG Botânica.",
};

export default async function PromocoesPage() {
  const products = await getProducts();
  const promoProducts = products.filter(
    (p) => p.compareAtPrice && p.compareAtPrice > p.price
  );

  return (
    <ProductsExplorer
      products={promoProducts}
      categories={categories}
      brands={brands}
      title="Promoções"
      description="Seleção especial com preços reduzidos por tempo limitado."
    />
  );
}
