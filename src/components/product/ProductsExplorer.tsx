"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Product, Category, Brand } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  initialCategorySlug?: string;
  title?: string;
  description?: string;
}

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

export default function ProductsExplorer({
  products,
  categories,
  brands,
  initialCategorySlug,
  title,
  description,
}: Props) {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug ?? "");
  const [brandSlug, setBrandSlug] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (categorySlug) list = list.filter((p) => p.categorySlug === categorySlug);
    if (brandSlug) list = list.filter((p) => p.brandSlug === brandSlug);

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [products, query, categorySlug, brandSlug, sort]);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-verde-escuro mb-3">Categoria</h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setCategorySlug("")}
            className={`text-left text-sm rounded-lg px-3 py-1.5 transition-colors ${
              categorySlug === "" ? "bg-verde-escuro text-areia" : "hover:bg-verde-claro/15 text-verde-escuro/80"
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategorySlug(c.slug)}
              className={`text-left text-sm rounded-lg px-3 py-1.5 transition-colors ${
                categorySlug === c.slug
                  ? "bg-verde-escuro text-areia"
                  : "hover:bg-verde-claro/15 text-verde-escuro/80"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-verde-escuro mb-3">Marca</h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setBrandSlug("")}
            className={`text-left text-sm rounded-lg px-3 py-1.5 transition-colors ${
              brandSlug === "" ? "bg-verde-escuro text-areia" : "hover:bg-verde-claro/15 text-verde-escuro/80"
            }`}
          >
            Todas
          </button>
          {brands.map((b) => (
            <button
              key={b.slug}
              onClick={() => setBrandSlug(b.slug)}
              className={`text-left text-sm rounded-lg px-3 py-1.5 transition-colors ${
                brandSlug === b.slug
                  ? "bg-verde-escuro text-areia"
                  : "hover:bg-verde-claro/15 text-verde-escuro/80"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      {title && (
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-verde-escuro/70">{description}</p>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nesta seleção..."
          className="w-full sm:max-w-sm rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none placeholder:text-verde-escuro/40 focus:border-verde-musgo"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm text-verde-escuro outline-none focus:border-verde-musgo"
        >
          <option value="relevance">Relevância</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="rating">Melhor avaliação</option>
        </select>
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-verde-claro/50 px-4 py-2.5 text-sm font-medium text-verde-escuro sm:hidden"
        >
          <SlidersHorizontal size={15} /> Filtros
        </button>
        <span className="ml-auto text-sm text-verde-escuro/60 hidden sm:block">
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[220px_1fr]">
        <aside className="hidden sm:block">{FilterPanel}</aside>

        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-verde-claro/50 py-20 text-center text-verde-escuro/60">
            <p className="font-medium">Nenhum produto encontrado.</p>
            <p className="text-sm">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] sm:hidden">
          <div
            className="absolute inset-0 bg-verde-escuro/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto bg-branco p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-verde-escuro">
                Filtros
              </span>
              <button onClick={() => setFiltersOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
