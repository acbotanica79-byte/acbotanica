import "server-only";
import { getSetting } from "@/lib/settings";

const MP_API = "https://api.mercadopago.com";

export interface MpPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "BRL";
}

export async function createPreference(params: {
  items: MpPreferenceItem[];
  shipping: number;
  externalReference: string;
  payerEmail: string;
  payerName: string;
  siteUrl: string;
}) {
  const items = [...params.items];
  if (params.shipping > 0) {
    items.push({ title: "Frete", quantity: 1, unit_price: params.shipping, currency_id: "BRL" });
  }

  const token = await getSetting("MERCADOPAGO_ACCESS_TOKEN");
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      payer: { name: params.payerName, email: params.payerEmail },
      external_reference: params.externalReference,
      back_urls: {
        success: `${params.siteUrl}/checkout/sucesso`,
        failure: `${params.siteUrl}/checkout/erro`,
        pending: `${params.siteUrl}/checkout/sucesso`,
      },
      auto_return: "approved",
      notification_url: `${params.siteUrl}/api/webhooks/mercadopago`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago preference failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{ id: string; init_point: string; sandbox_init_point: string }>;
}

export async function getPayment(paymentId: string) {
  const token = await getSetting("MERCADOPAGO_ACCESS_TOKEN");
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Mercado Pago payment lookup failed: ${res.status}`);
  return res.json() as Promise<{ status: string; external_reference: string }>;
}
