import "server-only";

/**
 * Cliente para a API oficial da CJ Dropshipping (v2.0) — gratuita, sem mensalidade,
 * mas exige uma conta CJ real + apiKey gerada no painel deles para funcionar.
 * Sem CJ_API_KEY configurada, todas as funções lançam CjNotConfiguredError em vez
 * de fingir uma resposta — não há dropshipping "conectado" até isso existir de verdade.
 *
 * Docs oficiais: https://developers.cjdropshipping.com/en/api/api2/
 */

const CJ_API = "https://developers.cjdropshipping.com/api2.0/v1";

export class CjNotConfiguredError extends Error {
  constructor() {
    super("CJ_API_KEY não configurada — crie uma conta em cjdropshipping.com, gere a apiKey no painel e adicione em CJ_API_KEY no .env.local.");
    this.name = "CjNotConfiguredError";
  }
}

interface CjTokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: CjTokenCache | null = null;

function requireApiKey(): string {
  const key = process.env.CJ_API_KEY;
  if (!key) throw new CjNotConfiguredError();
  return key;
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const apiKey = requireApiKey();
  const res = await fetch(`${CJ_API}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  const data = await res.json();
  if (!res.ok || !data?.result) {
    throw new Error(`CJ getAccessToken falhou: ${res.status} ${data?.message ?? await res.text()}`);
  }

  tokenCache = {
    accessToken: data.data.accessToken,
    expiresAt: new Date(data.data.accessTokenExpiryDate).getTime(),
  };
  return tokenCache.accessToken;
}

async function cjFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${CJ_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
      ...init?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok || data?.result === false) {
    throw new Error(`CJ API ${path} falhou: ${res.status} ${data?.message ?? JSON.stringify(data)}`);
  }
  return data.data as T;
}

export interface CjProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  sellPrice: string;
  productImage: string;
  categoryName: string;
}

/** Busca produtos no catálogo CJ por palavra-chave (ex: "vaso ceramica", "regador"). */
export async function searchCjProducts(keyword: string, pageSize = 20) {
  return cjFetch<{ list: CjProduct[]; total: number }>(
    `/product/list?productNameEn=${encodeURIComponent(keyword)}&pageSize=${pageSize}&pageNum=1`
  );
}

export async function getCjProductDetail(pid: string) {
  return cjFetch<CjProduct & { variants: unknown[]; description: string }>(
    `/product/query?pid=${encodeURIComponent(pid)}`
  );
}

export async function getCjStock(vid: string) {
  return cjFetch<{ storageNum: number }>(`/product/stock/queryByVid?vid=${encodeURIComponent(vid)}`);
}

export interface CjOrderInput {
  orderNumber: string;
  shippingCountryCode: string;
  shippingProvince: string;
  shippingCity: string;
  shippingAddress: string;
  shippingZip: string;
  shippingCustomerName: string;
  shippingPhone: string;
  products: { vid: string; quantity: number }[];
}

/** Cria um pedido real na CJ — isso GASTA dinheiro de verdade na conta CJ. Só chamar após confirmação explícita. */
export async function createCjOrder(order: CjOrderInput) {
  return cjFetch<{ orderId: string }>(`/shopping/order/createOrder`, {
    method: "POST",
    body: JSON.stringify(order),
  });
}

export async function getCjOrderDetail(orderId: string) {
  return cjFetch<{ orderId: string; orderStatus: string; trackNumber?: string }>(
    `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(orderId)}`
  );
}

export function isCjConfigured() {
  return Boolean(process.env.CJ_API_KEY);
}
