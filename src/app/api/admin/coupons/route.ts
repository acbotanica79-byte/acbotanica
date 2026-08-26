import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountType = body?.discountType === "fixed" ? "fixed" : body?.discountType === "percent" ? "percent" : null;
  const discountValue = Number(body?.discountValue);

  if (!code || !discountType || !(discountValue > 0)) {
    return NextResponse.json({ error: "Código, tipo e valor do desconto são obrigatórios." }, { status: 400 });
  }
  if (discountType === "percent" && discountValue > 100) {
    return NextResponse.json({ error: "Desconto percentual não pode passar de 100%." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_value: Number(body?.minOrderValue) || 0,
      usage_limit: body?.usageLimit != null && body.usageLimit !== "" ? Number(body.usageLimit) : null,
      expires_at: body?.expiresAt || null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505" ? "Já existe um cupom com esse código." : error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json(data);
}
