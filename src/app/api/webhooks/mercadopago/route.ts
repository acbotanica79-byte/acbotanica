import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

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
    await supabase
      .from("orders")
      .update({ status, payment_id: String(paymentId), updated_at: new Date().toISOString() })
      .eq("id", orderId);
  } catch (err) {
    console.error("mercadopago webhook failed", err);
  }

  return NextResponse.json({ ok: true });
}
