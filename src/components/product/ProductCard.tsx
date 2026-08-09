"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites";
import { useCartStore } from "@/store/cart";

export default function ProductCard({ product }: { product: Product }) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-branco/90 border border-verde-claro/25 shadow-[0_1px_2px_rgba(27,67,50,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(27,67,50,0.12)]">
      <Link href={`/produtos/${product.slug}`} className="relative block aspect-square overflow-hidden bg-areia">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-verde-escuro px-2.5 py-1 text-[11px] font-semibold text-areia">
              Novidade
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-terracota px-2.5 py-1 text-[11px] font-semibold text-branco">
              Promoção
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-branco/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-branco"
          aria-label="Favoritar"
        >
          <Heart
            size={16}
            className={isFavorite ? "fill-terracota text-terracota" : "text-verde-escuro"}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-wide text-verde-musgo/70 font-medium">
          {product.subcategory ?? product.categorySlug}
        </p>
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="mt-1 font-display text-base font-semibold text-verde-escuro line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-verde-escuro/60">
          <Star size={12} className="fill-dourado text-dourado" />
          {product.rating.toFixed(1)}
          <span className="text-verde-escuro/40">({product.reviewCount})</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-verde-escuro">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-verde-escuro/40 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        <button
          onClick={() => addItem(product)}
          className="mt-4 w-full rounded-full border border-verde-escuro py-2 text-sm font-medium text-verde-escuro transition-colors hover:bg-verde-escuro hover:text-areia"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
