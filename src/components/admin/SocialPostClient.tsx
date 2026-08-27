"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Download, Tag, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductLite {
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
}

export default function SocialPostClient({ products }: { products: ProductLite[] }) {
  const [filter, setFilter] = useState<"todos" | "promocao">("promocao");
  const [preview, setPreview] = useState<{ slug: string; name: string; url: string } | null>(null);
  const generationCount = useRef(0);

  const visible = products.filter((p) => (filter === "promocao" ? p.compareAtPrice && p.compareAtPrice > p.price : true));

  function handleGenerate(product: ProductLite) {
    generationCount.current += 1;
    setPreview({
      slug: product.slug,
      name: product.name,
      url: `/api/admin/social-post/image?slug=${encodeURIComponent(product.slug)}&t=${generationCount.current}`,
    });
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("promocao")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            filter === "promocao" ? "bg-verde-escuro text-areia" : "bg-verde-claro/20 text-verde-escuro"
          }`}
        >
          Em promoção
        </button>
        <button
          type="button"
          onClick={() => setFilter("todos")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            filter === "todos" ? "bg-verde-escuro text-areia" : "bg-verde-claro/20 text-verde-escuro"
          }`}
        >
          Todos os produtos
        </button>
      </div>

      {visible.length === 0 && (
        <p className="rounded-2xl border border-verde-claro/30 bg-branco p-5 text-sm text-verde-escuro/60">
          Nenhum produto {filter === "promocao" ? "em promoção" : "ativo"} encontrado.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((product) => (
          <div key={product.slug} className="rounded-2xl border border-verde-claro/30 bg-branco p-4">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-verde-claro/10">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-verde-escuro">{product.name}</h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-verde-escuro">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <>
                      <span className="text-verde-escuro/40 line-through">{formatPrice(product.compareAtPrice)}</span>
                      <span className="flex items-center gap-0.5 rounded-full bg-terracota/10 px-1.5 py-0.5 text-[10px] font-semibold text-terracota">
                        <Tag size={9} />
                        -{Math.round(100 - (product.price / product.compareAtPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate(product)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-verde-escuro px-4 py-2 text-xs font-semibold text-areia hover:bg-verde-musgo"
            >
              <Sparkles size={13} />
              Gerar imagem do post
            </button>
          </div>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-verde-escuro/70 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-branco p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-verde-escuro/80 text-areia"
            >
              <X size={16} />
            </button>
            <h3 className="mb-3 pr-8 text-sm font-semibold text-verde-escuro">{preview.name}</h3>
            <div className="overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={preview.name} className="w-full" />
            </div>
            <a
              href={preview.url}
              download={`post-${preview.slug}.png`}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo"
            >
              <Download size={15} />
              Baixar imagem
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
