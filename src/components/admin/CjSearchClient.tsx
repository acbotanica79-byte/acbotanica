"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CjResult {
  pid: string;
  productName: string;
  productNameEn: string;
  sellPrice: string;
  productImage: string;
}

export default function CjSearchClient({
  configured,
  onSelect,
}: {
  configured: boolean;
  onSelect?: (result: CjResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CjResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const res = await fetch(`/api/admin/cj-search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error === "not_configured" ? "CJ_API_KEY não configurada ainda." : data.error ?? "Erro na busca.");
      return;
    }
    setResults(data.list ?? []);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={!configured}
          placeholder="Ex: vaso ceramica, regador, luminaria grow"
          className="w-full max-w-sm rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!configured || loading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Buscar
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-terracota">{error}</p>}

      {results && results.length === 0 && (
        <p className="mt-3 text-sm text-verde-escuro/50">Nenhum resultado para &quot;{query}&quot;.</p>
      )}

      {results && results.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <div key={r.pid} className="flex gap-3 rounded-xl border border-verde-claro/25 p-3">
              {r.productImage && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-areia">
                  {/* eslint-disable-next-line @next/next/no-img-element -- domínio de imagem da CJ não é fixo o suficiente para configurar em next.config remotePatterns */}
                  <img src={r.productImage} alt={r.productNameEn || r.productName} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-verde-escuro">{r.productNameEn || r.productName}</p>
                <p className="text-sm text-verde-musgo">{formatPrice(Number(r.sellPrice))} (USD, na CJ)</p>
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(r)}
                    className="mt-1.5 rounded-full border border-verde-musgo/40 px-3 py-1 text-xs font-semibold text-verde-musgo hover:bg-verde-musgo/10"
                  >
                    Usar este produto
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
