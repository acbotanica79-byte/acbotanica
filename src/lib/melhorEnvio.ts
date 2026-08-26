import "server-only";
import { getSetting } from "@/lib/settings";

export interface MelhorEnvioQuoteItem {
  weightGrams?: number;
  dimensions?: { height: number; width: number; depth: number };
  quantity: number;
}

export interface MelhorEnvioQuote {
  price: number;
  minDays: number;
  maxDays: number;
  carrierName: string;
}

const DEFAULT_DIMENSIONS_CM = { height: 11, width: 16, depth: 16 };
const DEFAULT_WEIGHT_KG = 0.3;

interface MelhorEnvioApiQuote {
  error?: string;
  price?: number | string;
  delivery_range?: { min?: number; max?: number };
  delivery_time?: number;
  company?: { name?: string };
}

/**
 * Cotação real de frete (Correios, Jadlog etc.) via Melhor Envio. Retorna null
 * quando a chave não está configurada ou a chamada falha — quem chama cai
 * automaticamente para a estimativa por distância/UF já existente, então
 * a venda nunca trava por causa dessa integração.
 */
export async function getMelhorEnvioQuote(
  originCep: string,
  destCep: string,
  items: MelhorEnvioQuoteItem[]
): Promise<MelhorEnvioQuote | null> {
  const token = await getSetting("MELHOR_ENVIO_TOKEN");
  if (!token || items.length === 0) return null;

  try {
    const res = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "ACCFG Botânica (acbotanica79@gmail.com)",
      },
      body: JSON.stringify({
        from: { postal_code: originCep.replace(/\D/g, "") },
        to: { postal_code: destCep.replace(/\D/g, "") },
        products: items.map((item, i) => ({
          id: String(i),
          width: item.dimensions?.width ?? DEFAULT_DIMENSIONS_CM.width,
          height: item.dimensions?.height ?? DEFAULT_DIMENSIONS_CM.height,
          length: item.dimensions?.depth ?? DEFAULT_DIMENSIONS_CM.depth,
          weight: item.weightGrams ? item.weightGrams / 1000 : DEFAULT_WEIGHT_KG,
          insurance_value: 0,
          quantity: item.quantity,
        })),
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const quotes: MelhorEnvioApiQuote[] = await res.json();
    if (!Array.isArray(quotes)) return null;

    const valid = quotes.filter((q) => !q.error && q.price != null);
    if (valid.length === 0) return null;

    const cheapest = valid.reduce((min, q) => (Number(q.price) < Number(min.price) ? q : min));
    return {
      price: Number(cheapest.price),
      minDays: cheapest.delivery_range?.min ?? cheapest.delivery_time ?? 3,
      maxDays: cheapest.delivery_range?.max ?? cheapest.delivery_time ?? 10,
      carrierName: cheapest.company?.name ?? "Transportadora",
    };
  } catch {
    return null;
  }
}
