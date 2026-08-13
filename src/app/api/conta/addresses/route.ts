import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const recipientName = typeof body?.recipientName === "string" ? body.recipientName.trim() : "";
  const cep = typeof body?.cep === "string" ? body.cep.replace(/\D/g, "") : "";
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const uf = typeof body?.uf === "string" ? body.uf.trim() : "";

  if (!recipientName || !cep || !address || !city || !uf) {
    return NextResponse.json({ error: "Preencha nome, CEP, endereço, cidade e UF." }, { status: 400 });
  }

  const isDefault = Boolean(body?.isDefault);
  if (isDefault) {
    const { error: resetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: typeof body?.label === "string" && body.label.trim() ? body.label.trim() : "Principal",
      recipient_name: recipientName,
      cep,
      address,
      number: typeof body?.number === "string" ? body.number.trim() || null : null,
      complement: typeof body?.complement === "string" ? body.complement.trim() || null : null,
      neighborhood: typeof body?.neighborhood === "string" ? body.neighborhood.trim() || null : null,
      city,
      uf,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ address: data });
}
