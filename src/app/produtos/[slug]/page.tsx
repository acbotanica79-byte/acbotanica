import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchaseBox from "@/components/product/ProductPurchaseBox";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/product/ProductCard";
import { SITE_URL } from "@/lib/constants";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.images[0] }],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const related = getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: product.brandSlug },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produtos/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: product.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        }
      : undefined,
  };

  return (
    <div className="container-px mx-auto max-w-[1600px] py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 flex items-center gap-1.5 text-xs text-verde-escuro/55">
        <Link href="/" className="hover:text-verde-musgo">Home</Link>
        <ChevronRight size={13} />
        <Link href="/produtos" className="hover:text-verde-musgo">Produtos</Link>
        {category && (
          <>
            <ChevronRight size={13} />
            <Link href={`/categorias/${category.slug}`} className="hover:text-verde-musgo">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight size={13} />
        <span className="text-verde-escuro">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} photoNote={product.photoNote} />
        <ProductPurchaseBox product={product} />
      </div>

      <ProductTabs product={product} />

      {related.length > 0 && (
        <section className="mt-16 border-t border-verde-claro/25 pt-12">
          <h2 className="mb-8 font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
            Produtos relacionados
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
