"use client";

import { useState, useEffect } from "react";
import { Truck, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface FreteResponse {
  city: string;
  price: number;
  free: boolean;
  minDays: number;
  maxDays: number;
  distanceKm?: number;
  localidade: string;
  uf: string;
  logradouro: string;
  bairro: string;
  cep?: string;
}

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function FreteCalculator({
  subtotal,
  onResult,
}: {
  subtotal: number;
  onResult?: (result: FreteResponse | null) => void;
}) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreteResponse | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("accfg-botanica-cep");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preenche o CEP salvo só depois do mount, não afeta o HTML do servidor
    if (saved) setCep(maskCep(saved));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao calcular o frete");
      const resultWithCep = { ...data, cep: cep.replace(/\D/g, "") };
      setResult(resultWithCep);
      onResult?.(resultWithCep);
      localStorage.setItem("accfg-botanica-cep", cep.replace(/\D/g, ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao consultar o CEP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm focus-within:border-verde-musgo">
          <Truck size={16} className="shrink-0 text-verde-escuro/50" />
          <input
            value={cep}
            onChange={(e) => setCep(maskCep(e.target.value))}
            placeholder="Seu CEP"
            inputMode="numeric"
            maxLength={9}
            className="w-full bg-transparent text-verde-escuro outline-none placeholder:text-verde-escuro/40"
          />
        </div>
        <button
          type="submit"
          disabled={cep.replace(/\D/g, "").length !== 8 || loading}
          className="shrink-0 rounded-full bg-verde-escuro px-5 py-2.5 text-sm font-semibold text-branco transition-colors hover:bg-verde-musgo disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Calcular"}
        </button>
      </form>
      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-block text-xs text-verde-escuro/50 underline underline-offset-2 hover:text-verde-musgo"
      >
        Não sei meu CEP
      </a>

      {error && <p className="mt-2 text-sm text-terracota">{error}</p>}

      {result && (
        <div className="mt-3 rounded-xl bg-verde-escuro/[0.05] p-4 text-sm">
          <p className="font-medium text-verde-escuro">{result.city}</p>
          {result.free ? (
            <p className="mt-1 text-verde-musgo font-semibold">
              Frete grátis · chega em {result.minDays}-{result.maxDays} dias úteis
            </p>
          ) : (
            <p className="mt-1 text-verde-escuro/75">
              {formatPrice(result.price)} · chega em {result.minDays}-{result.maxDays} dias úteis
            </p>
          )}
        </div>
      )}
    </div>
  );
}
