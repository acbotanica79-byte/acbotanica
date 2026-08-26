"use client";

import { useState } from "react";
import { Check, Loader2, Save, ExternalLink, KeyRound } from "lucide-react";

type Source = "painel" | "vercel" | "nao_configurado";

interface IntegrationDef {
  key: string;
  label: string;
  description: string;
  helpUrl: string;
  helpLabel: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    key: "MERCADOPAGO_ACCESS_TOKEN",
    label: "Mercado Pago",
    description: "Necessário para o checkout processar pagamentos (PIX, cartão, boleto).",
    helpUrl: "https://www.mercadopago.com.br/developers/panel/app",
    helpLabel: "Pegar Access Token",
  },
  {
    key: "CJ_API_KEY",
    label: "CJ Dropshipping",
    description: "Busca automática de produtos e preços no catálogo da CJ, na aba Fornecedores.",
    helpUrl: "https://cjdropshipping.com",
    helpLabel: "Gerar apiKey em My CJ",
  },
  {
    key: "GROQ_API_KEY",
    label: "Groq (IA)",
    description: "Gera descrições de produto automaticamente ao cadastrar um item novo.",
    helpUrl: "https://console.groq.com/keys",
    helpLabel: "Gerar chave Groq",
  },
  {
    key: "GOOGLE_API_KEY",
    label: "Google API",
    description: "Reservado para futuras integrações com serviços do Google (ex: mapas, busca de endereço).",
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    helpLabel: "Gerar chave no Google Cloud",
  },
];

const SOURCE_LABEL: Record<Source, string> = {
  painel: "Configurada por aqui",
  vercel: "Configurada no Vercel",
  nao_configurado: "Não configurada",
};

const SOURCE_COLOR: Record<Source, string> = {
  painel: "bg-verde-musgo/15 text-verde-musgo",
  vercel: "bg-dourado/20 text-verde-escuro",
  nao_configurado: "bg-terracota/10 text-terracota",
};

export default function IntegrationsClient({
  initialStatus,
}: {
  initialStatus: { key: string; source: Source }[];
}) {
  const [status, setStatus] = useState(initialStatus);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<{ key: string; text: string } | null>(null);

  function sourceOf(key: string): Source {
    return status.find((s) => s.key === key)?.source ?? "nao_configurado";
  }

  async function handleSave(key: string) {
    const value = drafts[key]?.trim();
    if (!value) return;
    setSaving(key);
    setError(null);
    setSavedKey(null);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const data = await res.json();
    setSaving(null);

    if (!res.ok) {
      setError({ key, text: data.error ?? "Erro ao salvar." });
      return;
    }

    setStatus((prev) => prev.map((s) => (s.key === key ? { ...s, source: "painel" } : s)));
    setDrafts((prev) => ({ ...prev, [key]: "" }));
    setSavedKey(key);
    setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2500);
  }

  return (
    <div className="space-y-4">
      {INTEGRATIONS.map((integration) => {
        const source = sourceOf(integration.key);
        return (
          <div key={integration.key} className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-claro/20 text-verde-escuro">
                  <KeyRound size={15} />
                </span>
                <h3 className="font-semibold text-verde-escuro">{integration.label}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SOURCE_COLOR[source]}`}>
                {SOURCE_LABEL[source]}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-verde-escuro/55">{integration.description}</p>
            <a
              href={integration.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-verde-musgo hover:text-verde-escuro"
            >
              {integration.helpLabel} <ExternalLink size={11} />
            </a>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="password"
                value={drafts[integration.key] ?? ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [integration.key]: e.target.value }))}
                placeholder={source === "nao_configurado" ? "Cole a chave aqui" : "•••••••••••••••• (trocar)"}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
              <button
                type="button"
                onClick={() => handleSave(integration.key)}
                disabled={saving === integration.key || !drafts[integration.key]?.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo disabled:opacity-40"
              >
                {saving === integration.key ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : savedKey === integration.key ? (
                  <Check size={15} />
                ) : (
                  <Save size={15} />
                )}
                Salvar
              </button>
            </div>
            {error?.key === integration.key && (
              <p className="mt-2 text-xs text-terracota">{error.text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
