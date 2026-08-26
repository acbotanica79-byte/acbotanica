"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { SupplierRef } from "@/lib/data/suppliers";

export default function FornecedoresClient({ suppliers }: { suppliers: SupplierRef[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");

  const categories = useMemo(() => {
    const set = new Set(suppliers.flatMap((s) => s.categories));
    return Array.from(set).sort();
  }, [suppliers]);

  const filtered = useMemo(() => {
    let list = suppliers;
    if (category !== "todas") list = list.filter((s) => s.categories.includes(category));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.notes.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [suppliers, category, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-verde-escuro/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar fornecedor..."
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
        <span className="ml-auto text-xs text-verde-escuro/50">
          {filtered.length} de {suppliers.length} fornecedor(es)
        </span>
      </div>

      <ul className="mt-4 divide-y divide-verde-claro/15">
        {filtered.map((s) => (
          <li key={s.name} className="py-3">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-verde-musgo hover:text-verde-escuro"
            >
              {s.name} <ExternalLink size={12} />
            </a>
            <div className="mt-1 flex flex-wrap gap-1">
              {s.categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="rounded-full bg-verde-escuro/[0.06] px-2 py-0.5 text-[11px] font-medium text-verde-escuro/60 hover:bg-verde-escuro/10"
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-verde-escuro/70">{s.notes}</p>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-sm text-verde-escuro/50">Nenhum fornecedor encontrado para esses filtros.</li>
        )}
      </ul>
    </div>
  );
}
