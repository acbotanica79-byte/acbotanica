"use client";

import { useState } from "react";
import { Check, Loader2, Save, ExternalLink, KeyRound, Sparkles } from "lucide-react";

type Source = "painel" | "vercel" | "nao_configurado";

interface IntegrationDef {
  key: string;
  label: string;
  description: string;
  helpUrl: string;
  helpLabel: string;
  optional?: boolean;
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
    key: "MELHOR_ENVIO_TOKEN",
    label: "Melhor Envio",
    description: "Cotação real de frete (Correios, Jadlog etc.) no carrinho — substitui a estimativa por distância quando configurado.",
    helpUrl: "https://melhorenvio.com.br/painel/gerenciar/tokens",
    helpLabel: "Gerar token no Melhor Envio",
  },
  {
    key: "RESEND_API_KEY",
    label: "Resend (e-mail)",
    description: "Envia e-mail automático pro cliente quando o pedido é confirmado, comprado, enviado, entregue ou cancelado.",
    helpUrl: "https://resend.com/api-keys",
    helpLabel: "Gerar API key na Resend",
  },
  {
    key: "RESEND_FROM_EMAIL",
    label: "Resend — e-mail remetente",
    description: "Opcional. Coloque aqui um remetente de um domínio verificado na Resend. Sem isso, os e-mails saem do remetente de testes da Resend.",
    helpUrl: "https://resend.com/domains",
    helpLabel: "Verificar domínio próprio",
    optional: true,
  },
  {
    key: "WHATSAPP_CLOUD_TOKEN",
    label: "WhatsApp Cloud API — Token",
    description: "Avisa automaticamente o WhatsApp da loja (número cadastrado em Personalização) a cada pedido novo pago.",
    helpUrl: "https://developers.facebook.com/apps",
    helpLabel: "Gerar token no Meta for Developers",
    optional: true,
  },
  {
    key: "WHATSAPP_PHONE_ID",
    label: "WhatsApp Cloud API — ID do telefone",
    description: "Complementa o token acima — ID do número de WhatsApp Business cadastrado no Meta.",
    helpUrl: "https://developers.facebook.com/apps",
    helpLabel: "Achar o Phone Number ID",
    optional: true,
  },
  {
    key: "TURNSTILE_SITE_KEY",
    label: "Cloudflare Turnstile — Site Key",
    description: "Reservado para bloquear spam nos formulários (contato/cadastro). Ainda não conectado ao fluxo do site.",
    helpUrl: "https://dash.cloudflare.com/?to=/:account/turnstile",
    helpLabel: "Criar widget no Cloudflare",
    optional: true,
  },
  {
    key: "TURNSTILE_SECRET_KEY",
    label: "Cloudflare Turnstile — Secret Key",
    description: "Complementa a Site Key acima — usada no servidor pra validar o desafio.",
    helpUrl: "https://dash.cloudflare.com/?to=/:account/turnstile",
    helpLabel: "Criar widget no Cloudflare",
    optional: true,
  },
  {
    key: "GOOGLE_API_KEY",
    label: "Google API",
    description: "Reservado para futuras integrações com serviços do Google (ex: mapas).",
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    helpLabel: "Gerar chave no Google Cloud",
    optional: true,
  },
];

const ALWAYS_ON = [
  {
    name: "BrasilAPI",
    description: "Consulta de CEP com coordenadas, usada para calcular a distância real até o cliente.",
    url: "https://brasilapi.com.br",
  },
  {
    name: "ViaCEP",
    description: "Consulta de CEP de reserva — se a BrasilAPI cair, o checkout continua funcionando.",
    url: "https://viacep.com.br",
  },
  {
    name: "IBGE Localidades",
    description: "Base pública de municípios e estados brasileiros, sem necessidade de chave.",
    url: "https://servicodados.ibge.gov.br/api/docs/localidades",
  },
  {
    name: "AwesomeAPI Cotação",
    description: "Cotação de dólar em tempo real, sem chave — referência pro custo de fornecedores internacionais (ex: CJ Dropshipping).",
    url: "https://docs.awesomeapi.com.br/api-de-moedas",
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
    <div className="space-y-8">
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
                  {integration.optional && (
                    <span className="rounded-full bg-verde-escuro/[0.06] px-2 py-0.5 text-[10px] font-semibold text-verde-escuro/50">
                      Opcional
                    </span>
                  )}
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

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={15} className="text-verde-musgo" />
          <h2 className="text-sm font-semibold text-verde-escuro">APIs recomendadas — sempre ativas</h2>
        </div>
        <p className="mb-4 text-xs text-verde-escuro/55">
          Essas já funcionam automaticamente na loja, sem precisar de chave nem configuração.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ALWAYS_ON.map((api) => (
            <div key={api.name} className="rounded-2xl border border-verde-claro/30 bg-branco p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-verde-escuro">{api.name}</h3>
                <span className="rounded-full bg-verde-musgo/15 px-2 py-0.5 text-[10px] font-semibold text-verde-musgo">
                  Sempre ativa
                </span>
              </div>
              <p className="mt-1 text-xs text-verde-escuro/60">{api.description}</p>
              <a
                href={api.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-verde-musgo hover:text-verde-escuro"
              >
                Saiba mais <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
