import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.slug || !body?.name) {
    return NextResponse.json({ error: "Slug e nome são obrigatórios." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
