import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { brands } from "@/lib/data/brands";
import ProductsExplorer from "@/components/product/ProductsExplorer";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div>
      <div className="relative flex h-[280px] items-end overflow-hidden sm:h-[340px]">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-verde-escuro/90 via-verde-escuro/40 to-verde-escuro/10" />
        <div className="relative z-10 container-px mx-auto max-w-[1600px] pb-10">
          <h1 className="font-display text-4xl font-semibold text-branco sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-xl text-areia/85">{category.description}</p>
        </div>
      </div>

      <ProductsExplorer
        products={products}
        categories={categories}
        brands={brands}
        initialCategorySlug={slug}
        title=""
      />
    </div>
  );
}
