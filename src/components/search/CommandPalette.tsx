"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search, Leaf, Layers, FileText, CornerDownLeft } from "lucide-react";
import { useSearchStore } from "@/store/search";
import type { Product } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { formatPrice } from "@/lib/utils";

interface SearchItem {
  id: string;
  type: "produto" | "categoria" | "página";
  title: string;
  subtitle?: string;
  href: string;
}

const staticPages: SearchItem[] = [
  { id: "pg-home", type: "página", title: "Início", href: "/" },
  { id: "pg-produtos", type: "página", title: "Todos os produtos", href: "/produtos" },
  { id: "pg-categorias", type: "página", title: "Categorias", href: "/categorias" },
  { id: "pg-promocoes", type: "página", title: "Promoções", href: "/promocoes" },
  { id: "pg-novidades", type: "página", title: "Novidades", href: "/novidades" },
  { id: "pg-blog", type: "página", title: "Blog", href: "/blog" },
  { id: "pg-guias", type: "página", title: "Guias de cuidado", href: "/guias" },
  { id: "pg-cuidados", type: "página", title: "Cuidados", href: "/cuidados" },
  { id: "pg-especies", type: "página", title: "Espécies", href: "/especies" },
  { id: "pg-identificador", type: "página", title: "Identificador de Plantas", href: "/calculadoras/identificador" },
  { id: "pg-vaso-ideal", type: "página", title: "Calculadora de Vaso Ideal", href: "/calculadoras/vaso-ideal" },
  { id: "pg-rega", type: "página", title: "Calendário de Rega", href: "/calculadoras/calendario-rega" },
  { id: "pg-viveiros", type: "página", title: "Mapa de Viveiros", href: "/calculadoras/mapa-viveiros" },
  { id: "pg-carrinho", type: "página", title: "Carrinho", href: "/carrinho" },
  { id: "pg-favoritos", type: "página", title: "Favoritos", href: "/favoritos" },
  { id: "pg-contato", type: "página", title: "Contato", href: "/contato" },
];

export default function CommandPalette() {
  const { isOpen, open, close } = useSearchStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetch("/api/products")
        .then((r) => r.json())
        .then(setProducts)
        .catch(() => {});
    }
  }, [isOpen, products.length]);

  const items: SearchItem[] = useMemo(
    () => [
      ...products.map((p) => ({
        id: p.id,
        type: "produto" as const,
        title: p.name,
        subtitle: formatPrice(p.price),
        href: `/produtos/${p.slug}`,
      })),
      ...categories.map((c) => ({
        id: c.id,
        type: "categoria" as const,
        title: c.name,
        href: `/categorias/${c.slug}`,
      })),
      ...staticPages,
    ],
    [products]
  );

  const fuse = useMemo(
    () => new Fuse(items, { keys: ["title", "subtitle"], threshold: 0.35 }),
    [items]
  );

  const results = useMemo(() => {
    if (!query.trim()) return staticPages.slice(0, 6);
    return fuse.search(query, { limit: 8 }).map((r) => r.item);
  }, [query, fuse]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta a seleção ao trocar a busca ou abrir/fechar o palette
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useSearchStore.getState().toggle();
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpa a busca toda vez que o palette abre
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  function go(href: string) {
    router.push(href);
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex].href);
    }
  }

  if (!isOpen) return null;

  const icons = { produto: Leaf, categoria: Layers, página: FileText };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-verde-escuro/50 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-branco shadow-2xl">
        <div className="flex items-center gap-3 border-b border-verde-claro/25 px-5 py-4">
          <Search size={18} className="shrink-0 text-verde-escuro/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar plantas, vasos, categorias, páginas..."
            className="w-full bg-transparent text-verde-escuro outline-none placeholder:text-verde-escuro/40"
            onClick={() => open()}
          />
          <kbd className="hidden shrink-0 rounded border border-verde-claro/40 px-1.5 py-0.5 text-[10px] font-semibold text-verde-escuro/50 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-verde-escuro/50">
              Nenhum resultado para &quot;{query}&quot;
            </p>
          ) : (
            results.map((item, i) => {
              const Icon = icons[item.type];
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors ${
                    i === activeIndex ? "bg-verde-claro/20" : ""
                  }`}
                >
                  <Icon size={16} className="shrink-0 text-verde-musgo" />
                  <span className="flex-1 truncate text-verde-escuro">{item.title}</span>
                  {item.subtitle && (
                    <span className="shrink-0 text-xs text-verde-escuro/50">{item.subtitle}</span>
                  )}
                  <span className="shrink-0 rounded bg-verde-escuro/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-verde-escuro/45">
                    {item.type}
                  </span>
                  {i === activeIndex && <CornerDownLeft size={13} className="shrink-0 text-verde-escuro/40" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
