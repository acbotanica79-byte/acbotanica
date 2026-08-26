import { SETTABLE_KEYS, getSettingSource } from "@/lib/settings";
import IntegrationsClient from "@/components/admin/IntegrationsClient";

export default async function AdminIntegracoesPage() {
  const status = await Promise.all(
    SETTABLE_KEYS.map(async (key) => ({ key, source: await getSettingSource(key) }))
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Integrações</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">
        Cadastre aqui as chaves das ferramentas externas que a loja usa. Assim que salvar, o recurso
        correspondente passa a funcionar — sem precisar mexer em nenhuma configuração técnica.
      </p>
      <div className="mt-6 max-w-3xl">
        <IntegrationsClient initialStatus={status} />
      </div>
    </div>
  );
}
