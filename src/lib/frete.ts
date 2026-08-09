import "server-only";
import { FREE_SHIPPING_THRESHOLD, WAREHOUSE_UF } from "@/lib/constants";

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

/** Distância real (origem fixa do depósito → CEP de destino) quando temos coordenadas; cai para estimativa por estado quando não. */
export function calcularFrete(dest: CepResult, subtotal: number): FreteResult {
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;
  const originLat = Number(process.env.WAREHOUSE_LAT);
  const originLng = Number(process.env.WAREHOUSE_LNG);

  if (dest.lat != null && dest.lng != null && originLat && originLng) {
    const distanceKm = haversineKm(originLat, originLng, dest.lat, dest.lng);
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
