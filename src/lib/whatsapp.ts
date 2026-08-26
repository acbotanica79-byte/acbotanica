import "server-only";
import { getSetting } from "@/lib/settings";

/**
 * Envia uma mensagem de texto via WhatsApp Cloud API (Meta), usada pros avisos
 * automáticos pro WhatsApp da loja. Nunca lança: se não estiver configurado
 * ou a chamada falhar, só retorna false — não pode travar o checkout/webhook.
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  const token = await getSetting("WHATSAPP_CLOUD_TOKEN");
  const phoneId = await getSetting("WHATSAPP_PHONE_ID");
  if (!token || !phoneId || !to) return false;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body: text, preview_url: false },
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
