import "server-only";
import { FREE_SHIPPING_THRESHOLD, WAREHOUSE_UF, WAREHOUSE_CEP } from "@/lib/constants";
import { getMelhorEnvioQuote } from "@/lib/melhorEnvio";

export interface CepResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  lat?: number;
  lng?: number;
}

export interface FreteResult {
  uf: string;
  city: string;
  price: number;
  free: boolean;
  minDays: number;
  maxDays: number;
  zoneLabel: string;
  distanceKm?: number;
}

async function lookupBrasilApi(cleanCep: string): Promise<CepResult | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
    if (!res.ok) return null;
    const data = await res.json();
    const lat = data.location?.coordinates?.latitude;
    const lng = data.location?.coordinates?.longitude;
    return {
      cep: data.cep,
      logradouro: data.street ?? "",
      bairro: data.neighborhood ?? "",
      localidade: data.city,
      uf: data.state,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    };
  } catch {
    return null;
  }
}

async function lookupViaCep(cleanCep: string): Promise<CepResult | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
    };
  } catch {
    return null;
  }
}

/** BrasilAPI primeiro (traz coordenadas), ViaCEP como fallback — se uma cair, o checkout continua funcionando. */
export async function lookupCep(cep: string): Promise<CepResult> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) throw new Error("CEP inválido");

  const result = (await lookupBrasilApi(clean)) ?? (await lookupViaCep(clean));
  if (!result) throw new Error("CEP não encontrado");
  return result;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const DISTANCE_BANDS = [
  { maxKm: 30, price: 9.9, minDays: 1, maxDays: 2, label: "Região local" },
  { maxKm: 100, price: 14.9, minDays: 1, maxDays: 3, label: "Regional" },
  { maxKm: 300, price: 19.9, minDays: 2, maxDays: 4, label: "Estado / vizinhos" },
  { maxKm: 700, price: 24.9, minDays: 3, maxDays: 6, label: "Sudeste / Sul" },
  { maxKm: 1500, price: 34.9, minDays: 5, maxDays: 8, label: "Nordeste / Centro-Oeste" },
  { maxKm: Infinity, price: 49.9, minDays: 7, maxDays: 12, label: "Norte / longa distância" },
];

type Zone = "local" | "sudeste" | "sul" | "distante" | "remoto";

const ZONE_BY_UF: Record<string, Zone> = {
  SP: "local",
  RJ: "sudeste",
  MG: "sudeste",
  ES: "sudeste",
  PR: "sul",
  SC: "sul",
  RS: "sul",
  DF: "distante",
  GO: "distante",
  MT: "distante",
  MS: "distante",
  BA: "distante",
  SE: "distante",
  AL: "distante",
  PE: "distante",
  PB: "distante",
  RN: "distante",
  CE: "distante",
  PI: "distante",
  MA: "distante",
  AC: "remoto",
  AM: "remoto",
  RR: "remoto",
  RO: "remoto",
  PA: "remoto",
  AP: "remoto",
  TO: "remoto",
};

const ZONE_PRICING: Record<Zone, { price: number; minDays: number; maxDays: number; label: string }> = {
  local: { price: 12.9, minDays: 1, maxDays: 3, label: "Região metropolitana / SP" },
  sudeste: { price: 19.9, minDays: 2, maxDays: 5, label: "Sudeste" },
  sul: { price: 24.9, minDays: 3, maxDays: 6, label: "Sul" },
  distante: { price: 29.9, minDays: 5, maxDays: 9, label: "Centro-Oeste / Nordeste" },
  remoto: { price: 39.9, minDays: 7, maxDays: 14, label: "Norte" },
};

// Coordenadas do depósito (Mogi das Cruzes) resolvidas uma única vez a partir do
// CEP real de origem e cacheadas em memória do processo — nunca expostas ao cliente,
// só usadas aqui pra calcular a distância até o destino.
let warehouseCoordsCache: { lat: number; lng: number } | null | undefined;

async function getWarehouseCoords(): Promise<{ lat: number; lng: number } | null> {
  if (warehouseCoordsCache !== undefined) return warehouseCoordsCache;
  try {
    const origin = await lookupCep(WAREHOUSE_CEP);
    warehouseCoordsCache = origin.lat != null && origin.lng != null ? { lat: origin.lat, lng: origin.lng } : null;
  } catch {
    warehouseCoordsCache = null;
  }
  return warehouseCoordsCache;
}

/** Distância real (origem fixa do depósito → CEP de destino) quando temos coordenadas; cai para estimativa por estado quando não. */
export async function calcularFrete(dest: CepResult, subtotal: number): Promise<FreteResult> {
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;
  const originCoords = await getWarehouseCoords();

  if (dest.lat != null && dest.lng != null && originCoords) {
    const distanceKm = haversineKm(originCoords.lat, originCoords.lng, dest.lat, dest.lng);
    const band = DISTANCE_BANDS.find((b) => distanceKm <= b.maxKm)!;
    return {
      uf: dest.uf,
      city: "",
      price: free ? 0 : band.price,
      free,
      minDays: band.minDays,
      maxDays: band.maxDays,
      zoneLabel: band.label,
      distanceKm: Math.round(distanceKm),
    };
  }

  const zone = ZONE_BY_UF[dest.uf] ?? (dest.uf === WAREHOUSE_UF ? "local" : "distante");
  const pricing = ZONE_PRICING[zone];
  return {
    uf: dest.uf,
    city: "",
    price: free ? 0 : pricing.price,
    free,
    minDays: pricing.minDays,
    maxDays: pricing.maxDays,
    zoneLabel: pricing.label,
  };
}

// ── Frete real fornecedor → cliente (pro cálculo de comissão no admin) ──────
// Preço do produto = custo do fornecedor + comissão + frete real até o cliente.
// Sem CEP do fornecedor, estima por UF (sem chamar API nenhuma — não tem como
// "errar" por falha de rede). Com CEP dos dois lados, usa distância real
// (mesma lógica de cima) via BrasilAPI/ViaCEP, que já são gratuitas.

export interface SupplierFreightEstimate {
  price: number;
  label: string;
  source: "cep" | "uf" | "international" | "unknown";
  minDays: number;
  maxDays: number;
}

const UF_REGION: Record<string, string> = {
  SP: "Sudeste",
  RJ: "Sudeste",
  MG: "Sudeste",
  ES: "Sudeste",
  PR: "Sul",
  SC: "Sul",
  RS: "Sul",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  BA: "Nordeste",
  SE: "Nordeste",
  AL: "Nordeste",
  PE: "Nordeste",
  PB: "Nordeste",
  RN: "Nordeste",
  CE: "Nordeste",
  PI: "Nordeste",
  MA: "Nordeste",
  AC: "Norte",
  AM: "Norte",
  RR: "Norte",
  RO: "Norte",
  PA: "Norte",
  AP: "Norte",
  TO: "Norte",
};

/** Estimativa sem API nenhuma — só compara UF de origem e destino. Base para não deixar a conta sem número quando falta CEP exato. */
function estimateByUf(originUf: string, destUf: string): SupplierFreightEstimate {
  const days = { minDays: 7, maxDays: 15 };
  if (originUf === destUf) {
    return { price: 14.9, label: `Mesmo estado (${destUf})`, source: "uf", ...days };
  }
  const originRegion = UF_REGION[originUf];
  const destRegion = UF_REGION[destUf];
  if (originRegion && originRegion === destRegion) {
    return { price: 24.9, label: `Mesma região (${originRegion})`, source: "uf", ...days };
  }
  if (originRegion === "Norte" || destRegion === "Norte") {
    return { price: 59.9, label: `${originUf} → ${destUf} (Norte envolvido)`, source: "uf", ...days };
  }
  return { price: 34.9, label: `${originUf} → ${destUf}`, source: "uf", ...days };
}

/**
 * Estima o frete real entre o fornecedor escolhido pra um item e o cliente.
 * Prioridade: CEP do fornecedor (distância real, via API gratuita já usada no
 * checkout) > UF do fornecedor (tabela fixa, sem API) > internacional (taxa
 * fixa de importação) > desconhecido (sem estimativa ainda).
 */
export async function estimateSupplierFreight(params: {
  supplierCep?: string | null;
  supplierUf?: string | null;
  international?: boolean;
  destCep: string;
  destUf: string;
}): Promise<SupplierFreightEstimate | null> {
  if (params.international) {
    return { price: 45, label: "Frete internacional (estimativa)", source: "international", minDays: 15, maxDays: 35 };
  }

  if (params.supplierCep) {
    try {
      const [origin, dest] = await Promise.all([lookupCep(params.supplierCep), lookupCep(params.destCep)]);
      if (origin.lat != null && origin.lng != null && dest.lat != null && dest.lng != null) {
        const distanceKm = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
        const band = DISTANCE_BANDS.find((b) => distanceKm <= b.maxKm)!;
        return {
          price: band.price,
          label: `${band.label} · ${Math.round(distanceKm)} km (fornecedor → cliente)`,
          source: "cep",
          minDays: band.minDays,
          maxDays: band.maxDays,
        };
      }
    } catch {
      // CEP do fornecedor não resolveu — cai pro fallback por UF abaixo.
    }
  }

  if (params.supplierUf) {
    return estimateByUf(params.supplierUf, params.destUf);
  }

  return null;
}

// ── Frete do cliente, por origem (depósito vs fornecedor de cada produto) ──
// Produto com estoque próprio sai do depósito (Mogi) e é elegível a frete
// grátis acima de R$199. Produto dropshipping calcula a partir do fornecedor
// cadastrado nele; esse frete nunca fica grátis. Sem fornecedor cadastrado,
// cai como se saísse do depósito (mesma regra do estoque) pra não travar a venda.

export interface CartFreightItem {
  productId: string;
  quantity: number;
  productType: "dropshipping" | "estoque";
  supplierCep?: string | null;
  supplierUf?: string | null;
  supplierInternational?: boolean;
  weightGrams?: number | null;
  dimensions?: { height: number; width: number; depth: number } | null;
}

export interface FreightLine {
  origin: "deposito" | "fornecedor";
  label: string;
  price: number;
  free: boolean;
  minDays: number;
  maxDays: number;
  zoneLabel: string;
  distanceKm?: number;
}

export async function calcularFreteCarrinho(
  dest: CepResult,
  cartSubtotal: number,
  items: CartFreightItem[]
): Promise<FreightLine[]> {
  const lines: FreightLine[] = [];

  const hasSupplierOrigin = (i: CartFreightItem) => i.supplierCep || i.supplierUf || i.supplierInternational;

  const depositoItems = items.filter((i) => i.productType === "estoque" || !hasSupplierOrigin(i));
  if (depositoItems.length > 0) {
    const result = await calcularFrete(dest, cartSubtotal);
    let line: FreightLine = {
      origin: "deposito",
      label: "Depósito ACCFG Botânica",
      price: result.price,
      free: result.free,
      minDays: result.minDays,
      maxDays: result.maxDays,
      zoneLabel: result.zoneLabel,
      distanceKm: result.distanceKm,
    };

    // Cotação real (Correios/Jadlog etc.) quando o Melhor Envio está configurado —
    // sobrescreve só o preço/prazo estimados; se falhar, fica a estimativa acima.
    if (!result.free) {
      const quote = await getMelhorEnvioQuote(
        WAREHOUSE_CEP,
        dest.cep,
        depositoItems.map((i) => ({ weightGrams: i.weightGrams ?? undefined, dimensions: i.dimensions ?? undefined, quantity: i.quantity }))
      );
      if (quote) {
        line = { ...line, price: quote.price, minDays: quote.minDays, maxDays: quote.maxDays, label: `Depósito ACCFG Botânica · ${quote.carrierName}` };
      }
    }

    lines.push(line);
  }

  const supplierItems = items.filter((i) => i.productType === "dropshipping" && hasSupplierOrigin(i));
  const supplierGroups = new Map<string, CartFreightItem>();
  for (const item of supplierItems) {
    const key = item.supplierInternational ? "intl" : (item.supplierCep || item.supplierUf)!;
    if (!supplierGroups.has(key)) supplierGroups.set(key, item);
  }

  for (const item of supplierGroups.values()) {
    const est = await estimateSupplierFreight({
      supplierCep: item.supplierCep,
      supplierUf: item.supplierUf,
      international: item.supplierInternational,
      destCep: dest.cep,
      destUf: dest.uf,
    });
    if (!est) continue;
    lines.push({
      origin: "fornecedor",
      label: item.supplierInternational ? "Fornecedor internacional" : "Fornecedor parceiro",
      price: est.price,
      free: false,
      minDays: est.minDays,
      maxDays: est.maxDays,
      zoneLabel: est.label,
    });
  }

  return lines;
}
