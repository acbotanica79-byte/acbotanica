import { isCjConfigured } from "@/lib/dropshipping/cj";
import NovoProdutoClient from "./NovoProdutoClient";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Novo produto</h1>
      <div className="mt-6">
        <NovoProdutoClient cjConfigured={isCjConfigured()} />
      </div>
    </div>
  );
}
