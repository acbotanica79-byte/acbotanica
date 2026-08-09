"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, Minus, Plus, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { getBrandBySlug } from "@/lib/data/brands";
import ShareButtons from "@/components/product/ShareButtons";
import FreteCalculator from "@/components/product/FreteCalculator";

export default function ProductPurchaseBox({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const brand = getBrandBySlug(product.brandSlug);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div>
      {brand && (
        <Link
          href={`/produtos?marca=${brand.slug}`}
          className="text-xs font-semibold uppercase tracking-widest text-verde-musgo"
        >
          {brand.name}
        </Link>
      )}
      <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3 flex items-center gap-2 text-sm text-verde-escuro/70">
        <div className="flex items-center gap-1 text-dourado">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={15}
              className={i < Math.round(product.rating) ? "fill-dourado text-dourado" : "text-verde-claro/50"}
            />
          ))}
        </div>
        <span>{product.rating.toFixed(1)}</span>
        <span className="text-verde-escuro/40">({product.reviewCount} avaliações)</span>
      </div>

      <p className="mt-5 text-verde-escuro/75 leading-relaxed">{product.shortDescription}</p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-verde-escuro">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-verde-escuro/40 line-through">
            {formatPrice(product.compareAtPrice!)}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-verde-escuro/50">
        Catálogo digital — sem controle de estoque em tempo real.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-verde-claro/50">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-3 text-verde-escuro hover:text-verde-musgo"
            aria-label="Diminuir"
          >
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-3 text-verde-escuro hover:text-verde-musgo"
            aria-label="Aumentar"
          >
            <Plus size={15} />
          </button>
        </div>

        <button
          onClick={() => addItem(product, quantity)}
          className="flex-1 min-w-[180px] rounded-full bg-verde-escuro px-8 py-3.5 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo"
        >
          Adicionar ao carrinho
        </button>

        <button
          onClick={() => toggleFavorite(product.id)}
          aria-label="Favoritar"
          className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
            isFavorite
              ? "border-terracota bg-terracota/10 text-terracota"
              : "border-verde-claro/50 text-verde-escuro hover:bg-verde-claro/15"
          }`}
        >
          <Heart size={18} className={isFavorite ? "fill-terracota" : ""} />
        </button>
      </div>

      <div className="mt-6">
        <ShareButtons productName={product.name} />
      </div>

      <div className="mt-8 rounded-2xl border border-verde-claro/30 p-5">
        <p className="mb-3 text-sm font-semibold text-verde-escuro">Calcule o frete</p>
        <FreteCalculator subtotal={product.price * quantity} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-verde-escuro/80">
        <ShieldCheck size={17} className="text-verde-musgo shrink-0" />
        7 dias para trocas e devoluções
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-verde-claro/25 pt-6">
        {product.material && (
          <div>
            <dt className="text-verde-escuro/50">Material</dt>
            <dd className="text-verde-escuro font-medium">{product.material}</dd>
          </div>
        )}
        {product.color && (
          <div>
            <dt className="text-verde-escuro/50">Cor</dt>
            <dd className="text-verde-escuro font-medium">{product.color}</dd>
          </div>
        )}
        {product.weightGrams && (
          <div>
            <dt className="text-verde-escuro/50">Peso</dt>
            <dd className="text-verde-escuro font-medium">{(product.weightGrams / 1000).toFixed(1)} kg</dd>
          </div>
        )}
        {product.dimensions && (
          <div>
            <dt className="text-verde-escuro/50">Dimensões</dt>
            <dd className="text-verde-escuro font-medium">
              {product.dimensions.height}×{product.dimensions.width}×{product.dimensions.depth} cm
            </dd>
          </div>
        )}
      </dl>

      {product.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-verde-claro/20 px-3 py-1 text-xs font-medium text-verde-musgo"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
