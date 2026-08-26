import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if ("active" in body) update.active = Boolean(body.active);
  if ("discountValue" in body) update.discount_value = Number(body.discountValue);
  if ("minOrderValue" in body) update.min_order_value = Number(body.minOrderValue) || 0;
  if ("usageLimit" in body) update.usage_limit = body.usageLimit != null && body.usageLimit !== "" ? Number(body.usageLimit) : null;
  if ("expiresAt" in body) update.expires_at = body.expiresAt || null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para salvar." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("coupons").update(update).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
