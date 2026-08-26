import { suppliers } from "@/lib/data/suppliers";
import { isCjConfigured } from "@/lib/dropshipping/cj";
import CjSearchClient from "@/components/admin/CjSearchClient";
import FornecedoresClient from "@/components/admin/FornecedoresClient";

export default async function AdminFornecedoresPage() {
  const cjConfigured = await isCjConfigured();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Fornecedores</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">
        Referência para pesquisa manual de preço + busca automática no catálogo da CJ Dropshipping
        (quando configurada).
      </p>

      <div className="mt-6 rounded-2xl border border-verde-claro/30 bg-branco p-5">
        <h2 className="text-sm font-semibold text-verde-escuro">Busca ao vivo — CJ Dropshipping</h2>
        <p className="mt-1 text-xs text-verde-escuro/50">
          {cjConfigured
            ? "Conectado. Busque por palavra-chave para ver preço e imagem direto do catálogo deles."
            : <>Não configurado ainda: crie uma conta grátis em cjdropshipping.com, gere a apiKey em &quot;My CJ&quot; e adicione em <a href="/admin/integracoes" className="underline hover:text-verde-escuro">Integrações</a>.</>}
        </p>
        <div className="mt-4">
          <CjSearchClient configured={cjConfigured} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-verde-claro/30 bg-branco p-5">
        <h2 className="text-sm font-semibold text-verde-escuro">Referência curada (pesquisa manual)</h2>
        <p className="mt-1 text-xs text-verde-escuro/50">
          Não são integrações automáticas — são pontos de partida para você (ou quem for comprar)
          pesquisar preço real antes de fechar o pedido.
        </p>
        <div className="mt-4">
          <FornecedoresClient suppliers={suppliers} />
        </div>
      </div>
    </div>
  );
}
