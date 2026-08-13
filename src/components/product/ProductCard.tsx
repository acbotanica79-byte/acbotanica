"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const isOutOfStock = product.productType === "estoque" && !(product.stockQuantity && product.stockQuantity > 0);
  const [heartAnim, setHeartAnim] = useState(false);
  const [added, setAdded] = useState(false);

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    toggleFavorite(product.id);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
  }

  function handleAddToCart(e?: React.MouseEvent) {
    e?.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-branco border border-verde-claro/25 shadow-[0_1px_3px_rgba(27,67,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(27,67,50,0.14)]">
      {/* Imagem */}
      <Link href={`/produtos/${product.slug}`} className="relative block aspect-square overflow-hidden bg-areia">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-106"
        />

        {/* Hover overlay com botão de ver produto */}
        <div className="absolute inset-0 flex items-end justify-center bg-verde-escuro/0 transition-all duration-300 group-hover:bg-verde-escuro/30">
          <span className="mb-4 translate-y-4 rounded-full bg-branco/95 px-5 py-2 text-xs font-semibold text-verde-escuro opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Ver produto
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="rounded-full bg-verde-escuro px-2.5 py-1 text-[11px] font-semibold text-areia">
              Novidade
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-terracota px-2.5 py-1 text-[11px] font-bold text-branco">
              −{discountPct}%
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-verde-escuro/70 px-2.5 py-1 text-[11px] font-semibold text-areia">
              Esgotado
            </span>
          )}
        </div>

        {/* Botão de favoritar */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-branco/90 backdrop-blur-sm shadow-sm transition-all hover:bg-branco hover:scale-110"
          aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
        >
          <Heart
            size={16}
            className={`transition-all ${heartAnim ? "animate-[pulse-heart_0.4s_cubic-bezier(0.36,0.07,0.19,0.97)]" : ""} ${isFavorite ? "fill-terracota text-terracota" : "text-verde-escuro"}`}
          />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-wide text-verde-musgo/70 font-medium">
          {product.subcategory ?? product.categorySlug}
        </p>
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="mt-1 font-display text-base font-semibold text-verde-escuro line-clamp-2 leading-snug hover:text-verde-musgo transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-verde-escuro/60">
          <Star size={12} className="fill-dourado text-dourado" />
          {product.rating.toFixed(1)}
          <span className="text-verde-escuro/40">({product.reviewCount})</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
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
            onClick={() => handleAddToCart()}
            disabled={isOutOfStock}
            className={`mt-3 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
              added
                ? "border-verde-musgo bg-verde-musgo text-areia"
                : "border-verde-escuro text-verde-escuro hover:bg-verde-escuro hover:text-areia"
            }`}
          >
            <ShoppingBag size={14} />
            {isOutOfStock ? "Esgotado" : added ? "Adicionado!" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
