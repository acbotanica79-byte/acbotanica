"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Product } from "@/lib/types";

const TABS = ["Descrição", "Avaliações", "Perguntas"] as const;

export default function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Descrição");

  return (
    <div className="mt-16">
      <div className="flex gap-8 border-b border-verde-claro/30">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`relative pb-4 text-sm font-semibold transition-colors ${
              active === tab ? "text-verde-escuro" : "text-verde-escuro/45 hover:text-verde-escuro/70"
            }`}
          >
            {tab}
            {tab === "Avaliações" && ` (${product.reviewCount})`}
            {tab === "Perguntas" && ` (${product.qa.length})`}
            {active === tab && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-terracota" />
            )}
          </button>
        ))}
      </div>

      <div className="py-8 max-w-3xl">
        {active === "Descrição" && (
          <p className="leading-relaxed text-verde-escuro/80 whitespace-pre-line">
            {product.description}
          </p>
        )}

        {active === "Avaliações" && (
          <div className="space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-verde-escuro/60">Ainda não há avaliações para este produto.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="border-b border-verde-claro/20 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-verde-escuro">{review.author}</span>
                    <span className="text-xs text-verde-escuro/50">{review.date}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5 text-dourado">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < review.rating ? "fill-dourado text-dourado" : "text-verde-claro/40"}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-verde-escuro/75">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {active === "Perguntas" && (
          <div className="space-y-6">
            {product.qa.length === 0 ? (
              <p className="text-verde-escuro/60">Nenhuma pergunta ainda. Seja o primeiro a perguntar!</p>
            ) : (
              product.qa.map((qa) => (
                <div key={qa.id} className="border-b border-verde-claro/20 pb-6">
                  <p className="font-medium text-verde-escuro">P: {qa.question}</p>
                  {qa.answer && (
                    <p className="mt-2 text-sm text-verde-escuro/75">R: {qa.answer}</p>
                  )}
                  <span className="mt-1 block text-xs text-verde-escuro/40">{qa.date}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
