import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Chaves que a Aline pode cadastrar direto no painel (/admin/integracoes), sem mexer no Vercel. */
export const SETTABLE_KEYS = [
  "GOOGLE_API_KEY",
  "CJ_API_KEY",
  "GROQ_API_KEY",
  "MERCADOPAGO_ACCESS_TOKEN",
  "MELHOR_ENVIO_TOKEN",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "WHATSAPP_CLOUD_TOKEN",
  "WHATSAPP_PHONE_ID",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "CANVA_CLIENT_ID",
  "CANVA_CLIENT_SECRET",
  "CANVA_BRAND_TEMPLATE_ID",
] as const;
export type SettableKey = (typeof SETTABLE_KEYS)[number];

let cache: Map<string, string> | null = null;
let cacheExpiresAt = 0;

async function loadSettings(): Promise<Map<string, string>> {
  if (cache && Date.now() < cacheExpiresAt) return cache;

  const supabase = createAdminClient();
  const { data } = await supabase.from("app_settings").select("key, value");

  cache = new Map((data ?? []).map((row) => [row.key, row.value]));
  cacheExpiresAt = Date.now() + 30_000; // 30s — evita 1 round-trip por request sem travar mudanças recentes por muito tempo
  return cache;
}

/** Busca uma chave: prioriza o que a Aline cadastrou no painel, cai para a env var (Vercel) se não houver. */
export async function getSetting(key: SettableKey): Promise<string | null> {
  const settings = await loadSettings();
  return settings.get(key) || process.env[key] || null;
}

export async function isSettingConfigured(key: SettableKey): Promise<boolean> {
  return Boolean(await getSetting(key));
}

/** De onde o valor atual está vindo — só para exibir no painel, nunca o valor em si. */
export async function getSettingSource(key: SettableKey): Promise<"painel" | "vercel" | "nao_configurado"> {
  const settings = await loadSettings();
  if (settings.get(key)) return "painel";
  if (process.env[key]) return "vercel";
  return "nao_configurado";
}

export async function saveSetting(key: SettableKey, value: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  cache = null; // força reler na próxima chamada
}
