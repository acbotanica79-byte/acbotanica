import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const allowed: Record<string, unknown> = {};
  if (typeof body.status === "string") allowed.status = body.status;
  if (typeof body.notes === "string") allowed.notes = body.notes;

  const supabase = createAdminClient();

  let previousStatus: string | undefined;
  if (allowed.status) {
    const { data: previous } = await supabase.from("orders").select("status").eq("id", id).single();
    previousStatus = previous?.status;
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Só avisa o cliente numa mudança de status de verdade — evita e-mail
  // repetido quando o admin só atualiza notas ou refaz o mesmo status.
  if (typeof allowed.status === "string" && allowed.status !== previousStatus) {
    await sendOrderStatusEmail({
      orderNumber: data.order_number,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      total: Number(data.total),
      status: allowed.status,
    });
  }

  return NextResponse.json(data);
}
