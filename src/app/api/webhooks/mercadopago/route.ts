import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getSiteTheme } from "@/lib/theme";
import { formatPrice } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // O Mercado Pago manda vários formatos de notificação; o que importa é o payment id.
  const paymentId: string | undefined = body?.data?.id ?? (body?.type === "payment" ? body?.id : undefined);

  if (!paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await getPayment(String(paymentId));
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ ok: true });

    const status = payment.status === "approved" ? "novo" : payment.status === "rejected" ? "cancelado" : "aguardando_pagamento";

    const supabase = createAdminClient();
    const { data: previous } = await supabase.from("orders").select("status").eq("id", orderId).single();

    const { data: updated } = await supabase
      .from("orders")
      .update({ status, payment_id: String(paymentId), updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("order_number, customer_name, customer_email, total")
      .single();

    // Só dispara e-mail/WhatsApp na transição pra "novo" (evita reenviar em
    // notificações repetidas do Mercado Pago pro mesmo pagamento já aprovado).
    if (status === "novo" && previous?.status !== "novo" && updated) {
      await sendOrderConfirmationEmail({
        orderNumber: updated.order_number,
        customerName: updated.customer_name,
        customerEmail: updated.customer_email,
        total: Number(updated.total),
      });

      const theme = await getSiteTheme();
      await sendWhatsAppMessage(
        theme.whatsappNumber,
        `🌱 Pedido novo!\n${updated.order_number} — ${updated.customer_name}\nTotal: ${formatPrice(Number(updated.total))}\n\nVer no admin: /admin/pedidos`
      );
    }
  } catch (err) {
    console.error("mercadopago webhook failed", err);
  }

  return NextResponse.json({ ok: true });
}
