import { isCjConfigured } from "@/lib/dropshipping/cj";
import NovoProdutoClient from "./NovoProdutoClient";

export default async function NovoProdutoPage() {
  const cjConfigured = await isCjConfigured();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Novo produto</h1>
      <div className="mt-6">
        <NovoProdutoClient cjConfigured={cjConfigured} />
      </div>
    </div>
  );
}
