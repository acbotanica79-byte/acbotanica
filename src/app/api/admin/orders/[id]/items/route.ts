import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.itemId) return NextResponse.json({ error: "itemId é obrigatório." }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("order_items")
    .update({
      supplier_name: body.supplierName ?? null,
      supplier_cost: body.supplierCost === "" || body.supplierCost == null ? null : Number(body.supplierCost),
    })
    .eq("id", body.itemId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
