"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { products } from "@/lib/data/products";
import ProductCard from "@/components/product/ProductCard";

export default function FavoritosClient() {
  const productIds = useFavoritesStore((s) => s.productIds);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount guard for persisted store
  useEffect(() => setMounted(true), []);

  const list = mounted ? products.filter((p) => productIds.includes(p.id)) : [];

  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Sua coleção
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Favoritos
        </h1>
      </div>

      {!mounted || list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-verde-claro/50 py-24 text-center text-verde-escuro/60">
          <Heart size={36} strokeWidth={1.5} />
          <p>Você ainda não favoritou nenhum produto.</p>
          <Link
            href="/produtos"
            className="mt-2 rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-medium text-areia hover:bg-verde-musgo"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
