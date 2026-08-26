import "server-only";
import { getSetting } from "@/lib/settings";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

// Remetente padrão do Resend: funciona sem verificar domínio (só some/vercel.app
// não dá pra verificar por DNS). Se cadastrar um domínio próprio na Resend, dá
// pra trocar depois cadastrando RESEND_FROM_EMAIL em Integrações.
const DEFAULT_FROM = "onboarding@resend.dev";

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
}

/**
 * Envia o e-mail de confirmação de pedido via Resend. Não lança erro se a
 * chave não estiver configurada ou o envio falhar — o pedido já foi salvo,
 * um e-mail perdido não pode derrubar o fluxo de pagamento.
 */
export async function sendOrderConfirmationEmail(order: OrderConfirmationData): Promise<boolean> {
  const apiKey = await getSetting("RESEND_API_KEY");
  if (!apiKey || !order.customerEmail) return false;

  const fromEmail = (await getSetting("RESEND_FROM_EMAIL")) || DEFAULT_FROM;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <${fromEmail}>`,
        to: order.customerEmail,
        subject: `Pedido ${order.orderNumber} confirmado — ${SITE_NAME}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2b2f28;">
            <h2>Recebemos seu pedido, ${order.customerName.split(" ")[0]}! 🌱</h2>
            <p>O pagamento do pedido <strong>${order.orderNumber}</strong> foi confirmado e já estamos preparando tudo.</p>
            <p style="font-size: 18px; font-weight: 600;">Total: ${formatPrice(order.total)}</p>
            <p>Você pode acompanhar o status em <a href="${SITE_URL}/conta/pedidos">${SITE_URL}/conta/pedidos</a>.</p>
            <p style="margin-top: 24px; font-size: 13px; color: #6b7264;">Dúvidas? Responda este e-mail ou fale com a gente em ${CONTACT_EMAIL}.</p>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
