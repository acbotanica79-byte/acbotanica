import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  if (!fullName) return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });

  const cpf = typeof body?.cpf === "string" ? body.cpf.replace(/\D/g, "") : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";

  // Atualiza com o client autenticado do próprio usuário (RLS "user can update own profile"),
  // não com o client service_role: a tabela profiles não tem grants para service_role no banco,
  // o que fazia essa escrita falhar silenciosamente (PGRST205) mesmo com a tabela existindo.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      cpf: cpf || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
