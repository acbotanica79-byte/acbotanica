import "server-only";
import { getSetting } from "@/lib/settings";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

// Remetente padrão do Resend: funciona sem verificar domínio (só some/vercel.app
// não dá pra verificar por DNS). Se cadastrar um domínio próprio na Resend, dá
// pra trocar depois cadastrando RESEND_FROM_EMAIL em Integrações.
const DEFAULT_FROM = "onboarding@resend.dev";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = await getSetting("RESEND_API_KEY");
  if (!apiKey || !to) return false;

  const fromEmail = (await getSetting("RESEND_FROM_EMAIL")) || DEFAULT_FROM;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: `${SITE_NAME} <${fromEmail}>`, to, subject, html }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
}

function emailWrapper(bodyHtml: string): string {
  return `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2b2f28;">${bodyHtml}<p style="margin-top: 24px; font-size: 13px; color: #6b7264;">Dúvidas? Responda este e-mail ou fale com a gente em ${CONTACT_EMAIL}.</p></div>`;
}

/**
 * Envia o e-mail de confirmação de pedido via Resend. Não lança erro se a
 * chave não estiver configurada ou o envio falhar — o pedido já foi salvo,
 * um e-mail perdido não pode derrubar o fluxo de pagamento.
 */
export async function sendOrderConfirmationEmail(order: OrderConfirmationData): Promise<boolean> {
  return sendEmail(
    order.customerEmail,
    `Pedido ${order.orderNumber} confirmado — ${SITE_NAME}`,
    emailWrapper(`
      <h2>Recebemos seu pedido, ${order.customerName.split(" ")[0]}! 🌱</h2>
      <p>O pagamento do pedido <strong>${order.orderNumber}</strong> foi confirmado e já estamos preparando tudo.</p>
      <p style="font-size: 18px; font-weight: 600;">Total: ${formatPrice(order.total)}</p>
      <p>Você pode acompanhar o status em <a href="${SITE_URL}/conta/pedidos">${SITE_URL}/conta/pedidos</a>.</p>
    `)
  );
}

const STATUS_LABEL: Record<string, string> = {
  comprado: "Comprado do fornecedor",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_MESSAGE: Record<string, string> = {
  comprado: "Já compramos seu(s) item(ns) do fornecedor — a próxima etapa é o envio.",
  enviado: "Seu pedido saiu pra entrega! 📦",
  entregue: "Seu pedido foi entregue. Esperamos que ame suas plantas novas! 🌿",
  cancelado: "Seu pedido foi cancelado. Se não esperava por isso, responda este e-mail.",
};

/** Avisa o cliente quando o admin muda o status do pedido (Kanban/detalhe). */
export async function sendOrderStatusEmail(order: OrderConfirmationData & { status: string }): Promise<boolean> {
  const label = STATUS_LABEL[order.status];
  if (!label) return false; // status sem e-mail associado (ex: "novo" já tem o de confirmação)

  return sendEmail(
    order.customerEmail,
    `Pedido ${order.orderNumber}: ${label} — ${SITE_NAME}`,
    emailWrapper(`
      <h2>Olá, ${order.customerName.split(" ")[0]}!</h2>
      <p>${STATUS_MESSAGE[order.status]}</p>
      <p style="font-size: 14px; color: #6b7264;">Pedido <strong>${order.orderNumber}</strong></p>
      <p>Acompanhe em <a href="${SITE_URL}/conta/pedidos">${SITE_URL}/conta/pedidos</a>.</p>
    `)
  );
}
