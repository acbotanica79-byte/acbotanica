import type { Metadata } from "next";
import ProductsExplorer from "@/components/product/ProductsExplorer";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "Novidades",
  description: "Os lançamentos mais recentes do catálogo AC Botânica.",
};

export default function NovidadesPage() {
  const newProducts = products.filter((p) => p.isNew);

  return (
    <ProductsExplorer
      products={newProducts}
      categories={categories}
      brands={brands}
      title="Novidades"
      description="Os últimos lançamentos da nossa curadoria botânica."
    />
  );
}
