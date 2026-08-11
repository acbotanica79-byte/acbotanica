"use client";

import { useState } from "react";
import { Search, PenLine } from "lucide-react";
import CjSearchClient from "@/components/admin/CjSearchClient";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";

interface CjResult {
  pid: string;
  productName: string;
  productNameEn: string;
  sellPrice: string;
  productImage: string;
}

export default function NovoProdutoClient({ cjConfigured }: { cjConfigured: boolean }) {
  const [mode, setMode] = useState<"choose" | "cj" | "manual">("choose");
  const [prefill, setPrefill] = useState<Partial<ProductFormValues> | undefined>(undefined);
  const [prefillKey, setPrefillKey] = useState(0);

  function handleSelectCj(result: CjResult) {
    setPrefill({
      name: result.productNameEn || result.productName,
      images: result.productImage || "",
      photo_note: `Produto encontrado via busca CJ Dropshipping (pid: ${result.pid}, preço listado ${result.sellPrice} USD). Confira preço real, frete e prazo no painel da CJ antes de definir custo e preço de venda — não copie o valor em USD direto.`,
    });
    setPrefillKey((k) => k + 1);
    setMode("manual");
  }

  if (mode === "choose") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <button
          type="button"
          onClick={() => setMode("cj")}
          className="flex flex-col items-start gap-2 rounded-2xl border border-verde-claro/30 bg-branco p-5 text-left transition-colors hover:border-verde-musgo"
        >
          <Search size={20} className="text-verde-musgo" />
          <span className="font-semibold text-verde-escuro">Buscar fornecedor online</span>
          <span className="text-xs text-verde-escuro/60">
            Pesquisa ao vivo no catálogo da CJ Dropshipping — escolha um produto e o formulário
            já vem com nome e foto preenchidos.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className="flex flex-col items-start gap-2 rounded-2xl border border-verde-claro/30 bg-branco p-5 text-left transition-colors hover:border-verde-musgo"
        >
          <PenLine size={20} className="text-verde-musgo" />
          <span className="font-semibold text-verde-escuro">Cadastrar manualmente</span>
          <span className="text-xs text-verde-escuro/60">
            Preencha tudo do zero — use o botão &quot;Gerar com IA&quot; para a descrição se quiser.
          </span>
        </button>
      </div>
    );
  }

  if (mode === "cj") {
    return (
      <div className="max-w-2xl">
        <button
          type="button"
          onClick={() => setMode("choose")}
          className="mb-4 text-xs font-medium text-verde-escuro/60 hover:text-verde-escuro"
        >
          ← Voltar
        </button>
        <p className="mb-3 text-sm text-verde-escuro/70">
          {cjConfigured
            ? "Busque por palavra-chave e clique em \"Usar este produto\" para preencher o formulário."
            : "CJ_API_KEY não configurada ainda — configure em .env.local / Vercel, ou cadastre manualmente."}
        </p>
        <CjSearchClient configured={cjConfigured} onSelect={handleSelectCj} />
        <button
          type="button"
          onClick={() => setMode("manual")}
          className="mt-4 text-xs font-medium text-verde-musgo hover:underline"
        >
          Prefiro cadastrar manualmente
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setMode("choose")}
        className="mb-4 text-xs font-medium text-verde-escuro/60 hover:text-verde-escuro"
      >
        ← Voltar
      </button>
      <ProductForm key={prefillKey} initial={prefill} />
    </div>
  );
}
