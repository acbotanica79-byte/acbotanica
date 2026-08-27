"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Sparkles, ExternalLink, Tag } from "lucide-react";
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
  const [generating, setGenerating] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visible = products.filter((p) => (filter === "promocao" ? p.compareAtPrice && p.compareAtPrice > p.price : true));

  async function handleGenerate(slug: string) {
    setGenerating(slug);
    setErrors((prev) => ({ ...prev, [slug]: "" }));
    try {
      const res = await fetch("/api/admin/canva/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar o post.");
      setResults((prev) => ({ ...prev, [slug]: data.editUrl }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [slug]: err instanceof Error ? err.message : "Erro desconhecido." }));
    } finally {
      setGenerating(null);
    }
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
              onClick={() => handleGenerate(product.slug)}
              disabled={generating === product.slug}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-verde-escuro px-4 py-2 text-xs font-semibold text-areia hover:bg-verde-musgo disabled:opacity-40"
            >
              {generating === product.slug ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Gerar post na Canva
            </button>

            {results[product.slug] && (
              <a
                href={results[product.slug]}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-verde-musgo hover:text-verde-escuro"
              >
                Abrir e editar na Canva <ExternalLink size={11} />
              </a>
            )}
            {errors[product.slug] && <p className="mt-2 text-xs text-terracota">{errors[product.slug]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
