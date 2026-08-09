"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getFeaturedProducts, getNewProducts, getProducts } from "@/lib/data/products";

const TABS = ["Mais vendidos", "Novidades", "Ofertas"] as const;
type Tab = (typeof TABS)[number];

export default function FeaturedProducts() {
  const [tab, setTab] = useState<Tab>("Mais vendidos");

  const products =
    tab === "Mais vendidos"
      ? getFeaturedProducts()
      : tab === "Novidades"
      ? getNewProducts()
      : getProducts().filter((p) => p.compareAtPrice);

  return (
    <section className="container-px mx-auto max-w-[1600px] py-16 sm:py-24">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
            Seleção da casa
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
            Produtos em Destaque
          </h2>
        </div>
        <Link
          href="/produtos"
          className="text-sm font-semibold text-verde-musgo underline decoration-verde-claro decoration-2 underline-offset-4 hover:text-verde-escuro"
        >
          Ver catálogo completo
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-verde-escuro text-branco"
                : "bg-verde-escuro/[0.06] text-verde-escuro/70 hover:bg-verde-escuro/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
