import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();
  const { error } = await admin
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
