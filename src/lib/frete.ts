import { FREE_SHIPPING_THRESHOLD, WAREHOUSE_UF } from "@/lib/constants";

export interface CepResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface FreteResult {
  uf: string;
  city: string;
  price: number;
  free: boolean;
  minDays: number;
  maxDays: number;
  zoneLabel: string;
}

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

async function lookupBrasilApi(cleanCep: string): Promise<CepResult | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      cep: data.cep,
      logradouro: data.street ?? "",
      bairro: data.neighborhood ?? "",
      localidade: data.city,
      uf: data.state,
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

/** BrasilAPI primeiro, ViaCEP como fallback — se uma cair, o checkout continua funcionando. */
export async function lookupCep(cep: string): Promise<CepResult> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) throw new Error("CEP inválido");

  const result = (await lookupBrasilApi(clean)) ?? (await lookupViaCep(clean));
  if (!result) throw new Error("CEP não encontrado");
  return result;
}

export function calcularFrete(uf: string, subtotal: number): FreteResult {
  const zone = ZONE_BY_UF[uf] ?? (uf === WAREHOUSE_UF ? "local" : "distante");
  const pricing = ZONE_PRICING[zone];
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    uf,
    city: "",
    price: free ? 0 : pricing.price,
    free,
    minDays: pricing.minDays,
    maxDays: pricing.maxDays,
    zoneLabel: pricing.label,
  };
}
