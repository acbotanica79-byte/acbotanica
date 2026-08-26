"use client";

import { useMemo, useState, useDeferredValue, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ExternalLink, Star, Sparkles, PackageX, Trash2, X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type AdminProduct = {
  id: string;
  name: string;
  images: string[];
  categorySlug: string;
  price: number;
  costPrice?: number;
  supplierUrl?: string;
  productType: "dropshipping" | "estoque";
  stockQuantity?: number;
  featured?: boolean;
  isNew?: boolean;
};

const LOW_STOCK_THRESHOLD = 5;

type TypeFilter = "todos" | "dropshipping" | "estoque";

export default function ProdutosClient({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("todas");
  const [type, setType] = useState<TypeFilter>("todos");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categorySlug));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "todas") list = list.filter((p) => p.categorySlug === category);
    if (type !== "todos") list = list.filter((p) => p.productType === type);
    if (lowStockOnly) {
      list = list.filter(
        (p) => p.productType === "estoque" && (p.stockQuantity ?? 0) <= LOW_STOCK_THRESHOLD
      );
    }
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.categorySlug.toLowerCase().includes(q));
    }
    return list;
  }, [products, category, type, lowStockOnly, deferredSearch]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const p of filtered) next.delete(p.id);
      } else {
        for (const p of filtered) next.add(p.id);
      }
      return next;
    });
  }, [filtered, allVisibleSelected]);

  async function bulkPatch(body: Record<string, unknown>) {
    setBusy(true);
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      )
    );
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  async function bulkDelete() {
    if (!confirm(`Excluir ${selected.size} produto(s) selecionado(s)? Essa ação não pode ser desfeita.`)) return;
    setBusy(true);
    await Promise.all(Array.from(selected).map((id) => fetch(`/api/admin/products/${id}`, { method: "DELETE" })));
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-verde-escuro/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-full border border-verde-claro/50 bg-branco py-2.5 pl-9 pr-4 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm text-verde-escuro outline-none focus:border-verde-musgo"
        >
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TypeFilter)}
          className="rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm text-verde-escuro outline-none focus:border-verde-musgo"
        >
          <option value="todos">Dropshipping + Estoque</option>
          <option value="dropshipping">Só dropshipping</option>
          <option value="estoque">Só estoque próprio</option>
        </select>
        <button
          type="button"
          onClick={() => setLowStockOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
            lowStockOnly
              ? "border-terracota bg-terracota/10 text-terracota"
              : "border-verde-claro/50 text-verde-escuro/70 hover:bg-verde-escuro/5"
          }`}
        >
          <PackageX size={14} /> Estoque baixo
        </button>
        <span className="ml-auto text-xs text-verde-escuro/50">
          {filtered.length} de {products.length} produto(s)
        </span>
      </div>

      {/* Barra de ações em massa */}
      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-verde-musgo/30 bg-verde-musgo/5 px-4 py-3">
          <span className="text-sm font-semibold text-verde-escuro">{selected.size} selecionado(s)</span>
          <button
            disabled={busy}
            onClick={() => bulkPatch({ featured: true })}
            className="flex items-center gap-1.5 rounded-full bg-branco px-3 py-1.5 text-xs font-semibold text-verde-escuro hover:bg-areia disabled:opacity-50"
          >
            <Star size={13} /> Destacar
          </button>
          <button
            disabled={busy}
            onClick={() => bulkPatch({ featured: false })}
            className="flex items-center gap-1.5 rounded-full bg-branco px-3 py-1.5 text-xs font-semibold text-verde-escuro hover:bg-areia disabled:opacity-50"
          >
            Remover destaque
          </button>
          <button
            disabled={busy}
            onClick={() => bulkPatch({ is_new: true })}
            className="flex items-center gap-1.5 rounded-full bg-branco px-3 py-1.5 text-xs font-semibold text-verde-escuro hover:bg-areia disabled:opacity-50"
          >
            <Sparkles size={13} /> Marcar como novo
          </button>
          <button
            disabled={busy}
            onClick={bulkDelete}
            className="flex items-center gap-1.5 rounded-full bg-terracota/10 px-3 py-1.5 text-xs font-semibold text-terracota hover:bg-terracota/20 disabled:opacity-50"
          >
            <Trash2 size={13} /> Excluir
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-verde-escuro/50 hover:text-verde-escuro"
          >
            <X size={13} /> Cancelar
          </button>
          {busy && <Loader2 size={14} className="animate-spin text-verde-escuro/50" />}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="w-10 p-4">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 rounded border-verde-claro/50"
                />
              </th>
              <th className="p-4">Produto</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Estoque</th>
              <th className="p-4">Custo</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Margem</th>
              <th className="p-4">Fornecedor</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const margin = p.costPrice != null ? p.price - p.costPrice : null;
              const marginPct = margin != null && p.price > 0 ? (margin / p.price) * 100 : null;
              const lowStock = p.productType === "estoque" && (p.stockQuantity ?? 0) <= LOW_STOCK_THRESHOLD;
              return (
                <tr key={p.id} className="border-b border-verde-claro/10 last:border-0 hover:bg-verde-escuro/[0.015]">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="h-4 w-4 rounded border-verde-claro/50"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-areia">
                          <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-medium text-verde-escuro">{p.name}</span>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {p.featured && (
                            <span className="rounded-full bg-dourado/20 px-1.5 py-0.5 text-[10px] font-semibold text-verde-escuro">
                              Destaque
                            </span>
                          )}
                          {p.isNew && (
                            <span className="rounded-full bg-verde-musgo/15 px-1.5 py-0.5 text-[10px] font-semibold text-verde-musgo">
                              Novo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-verde-escuro/70">{p.categorySlug}</td>
                  <td className="p-4">
                    {p.productType === "dropshipping" ? (
                      <span className="text-xs text-verde-escuro/40">Dropshipping</span>
                    ) : (
                      <span className={`text-xs font-semibold ${lowStock ? "text-terracota" : "text-verde-escuro/70"}`}>
                        {p.stockQuantity ?? 0} un.
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-verde-escuro/70">{p.costPrice != null ? formatPrice(p.costPrice) : "—"}</td>
                  <td className="p-4 font-medium text-verde-escuro">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    {margin != null ? (
                      <span className={margin >= 0 ? "text-verde-musgo" : "text-terracota"}>
                        {formatPrice(margin)}
                        {marginPct != null && <span className="text-verde-escuro/50"> ({marginPct.toFixed(0)}%)</span>}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    {p.supplierUrl ? (
                      <a
                        href={p.supplierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-medium text-verde-musgo hover:text-verde-escuro"
                        title={p.supplierUrl}
                      >
                        Ver <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-verde-escuro/40">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/produtos/${p.id}/editar`} className="text-sm font-semibold text-verde-musgo hover:text-verde-escuro">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-sm text-verde-escuro/50">
                  Nenhum produto encontrado para esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
