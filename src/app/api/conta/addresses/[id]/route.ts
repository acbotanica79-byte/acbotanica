import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const isDefault = Boolean(body?.isDefault);
  if (isDefault) {
    const { error: resetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.label === "string") update.label = body.label.trim() || "Principal";
  if (typeof body.recipientName === "string") update.recipient_name = body.recipientName.trim();
  if (typeof body.cep === "string") update.cep = body.cep.replace(/\D/g, "");
  if (typeof body.address === "string") update.address = body.address.trim();
  if (typeof body.number === "string") update.number = body.number.trim() || null;
  if (typeof body.complement === "string") update.complement = body.complement.trim() || null;
  if (typeof body.neighborhood === "string") update.neighborhood = body.neighborhood.trim() || null;
  if (typeof body.city === "string") update.city = body.city.trim();
  if (typeof body.uf === "string") update.uf = body.uf.trim();
  if (typeof body.isDefault === "boolean") update.is_default = body.isDefault;

  const { data, error } = await supabase
    .from("addresses")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });
  return NextResponse.json({ address: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
