import "server-only";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { SITE_URL } from "@/lib/constants";

/**
 * Integração com a Canva Connect API (OAuth 2.0 + Autofill API).
 * Fluxo: admin conecta a conta Canva uma vez (/api/admin/canva/connect) e o site guarda o
 * access/refresh token no app_settings (não são SETTABLE_KEYS — não são editáveis manualmente).
 */

const CANVA_AUTH_URL = "https://www.canva.com/api/oauth/authorize";
const CANVA_TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";
const CANVA_API_BASE = "https://api.canva.com/rest/v1";

export const CANVA_REDIRECT_URI = `${SITE_URL}/api/admin/canva/callback`;
export const CANVA_SCOPES = [
  "design:content:read",
  "design:content:write",
  "design:meta:read",
  "asset:read",
  "asset:write",
].join(" ");

const TOKEN_KEYS = {
  access: "CANVA_ACCESS_TOKEN",
  refresh: "CANVA_REFRESH_TOKEN",
  expiresAt: "CANVA_TOKEN_EXPIRES_AT",
} as const;

async function getToken(key: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

async function setTokens(accessToken: string, refreshToken: string, expiresInSeconds: number) {
  const supabase = createAdminClient();
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const rows = [
    { key: TOKEN_KEYS.access, value: accessToken, updated_at: new Date().toISOString() },
    { key: TOKEN_KEYS.refresh, value: refreshToken, updated_at: new Date().toISOString() },
    { key: TOKEN_KEYS.expiresAt, value: String(expiresAt), updated_at: new Date().toISOString() },
  ];
  const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export function generatePkce() {
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export async function getCanvaAuthorizeUrl(codeChallenge: string, state: string) {
  const clientId = await getSetting("CANVA_CLIENT_ID");
  if (!clientId) throw new Error("CANVA_CLIENT_ID não configurado.");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: CANVA_REDIRECT_URI,
    scope: CANVA_SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });
  return `${CANVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const clientId = await getSetting("CANVA_CLIENT_ID");
  const clientSecret = await getSetting("CANVA_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Credenciais da Canva não configuradas.");

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: CANVA_REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao trocar código pela Canva: ${text}`);
  }

  const data = await res.json();
  await setTokens(data.access_token, data.refresh_token, data.expires_in);
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = await getSetting("CANVA_CLIENT_ID");
  const clientSecret = await getSetting("CANVA_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Credenciais da Canva não configuradas.");

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao renovar token da Canva: ${text}`);
  }

  const data = await res.json();
  await setTokens(data.access_token, data.refresh_token, data.expires_in);
  return data.access_token as string;
}

export async function isCanvaConnected(): Promise<boolean> {
  return Boolean(await getToken(TOKEN_KEYS.refresh));
}

/** Retorna um access token válido, renovando com o refresh token se necessário. */
export async function getValidAccessToken(): Promise<string> {
  const [accessToken, refreshToken, expiresAtRaw] = await Promise.all([
    getToken(TOKEN_KEYS.access),
    getToken(TOKEN_KEYS.refresh),
    getToken(TOKEN_KEYS.expiresAt),
  ]);

  if (!refreshToken) {
    throw new Error("Canva não conectado. Vá em Integrações e clique em Conectar com a Canva.");
  }

  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : 0;
  const stillValid = accessToken && Date.now() < expiresAt - 60_000; // 1 min de folga
  if (stillValid) return accessToken;

  return refreshAccessToken(refreshToken);
}

interface AutofillDataField {
  type: "text" | "image";
  text?: string;
  asset_id?: string;
}

export async function uploadImageAsset(imageUrl: string, name: string): Promise<string> {
  const accessToken = await getValidAccessToken();
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Não consegui baixar a imagem do produto: ${imageUrl}`);
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  const uploadRes = await fetch(`${CANVA_API_BASE}/asset-uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
      "Asset-Upload-Metadata": JSON.stringify({ name_base64: Buffer.from(name).toString("base64") }),
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Falha ao subir imagem para a Canva: ${text}`);
  }

  const uploadData = await uploadRes.json();
  const jobId = uploadData.job.id as string;

  for (let attempt = 0; attempt < 15; attempt++) {
    const jobRes = await fetch(`${CANVA_API_BASE}/asset-uploads/${jobId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const jobData = await jobRes.json();
    if (jobData.job.status === "success") return jobData.job.asset.id as string;
    if (jobData.job.status === "failed") throw new Error(`Upload de imagem falhou: ${JSON.stringify(jobData.job.error)}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timeout ao subir imagem para a Canva.");
}

export async function createAutofillDesign(
  brandTemplateId: string,
  data: Record<string, AutofillDataField>,
  title: string
): Promise<{ designId: string; editUrl: string }> {
  const accessToken = await getValidAccessToken();

  const createRes = await fetch(`${CANVA_API_BASE}/autofills`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ brand_template_id: brandTemplateId, title, data }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Falha ao criar autofill na Canva: ${text}`);
  }

  const createData = await createRes.json();
  const jobId = createData.job.id as string;

  for (let attempt = 0; attempt < 20; attempt++) {
    const jobRes = await fetch(`${CANVA_API_BASE}/autofills/${jobId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const jobData = await jobRes.json();
    if (jobData.job.status === "success") {
      return {
        designId: jobData.job.result.design.id as string,
        editUrl: jobData.job.result.design.urls.edit_url as string,
      };
    }
    if (jobData.job.status === "failed") {
      throw new Error(`Geração do design falhou: ${JSON.stringify(jobData.job.error)}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Timeout ao gerar o design na Canva.");
}
