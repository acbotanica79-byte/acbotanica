import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Se "next" for passado, usamos ele. Se não, padrão é /conta/painel.
  const next = searchParams.get("next") ?? "/conta/painel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se falhar ou não tiver código, volta para a home.
  // Pode ser que tenha vindo do admin, mas por segurança mandamos pra home.
  return NextResponse.redirect(`${origin}/`);
}
