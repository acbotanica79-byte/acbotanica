import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { searchCjProducts, isCjConfigured, CjNotConfiguredError } from "@/lib/dropshipping/cj";

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  if (!isCjConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const keyword = req.nextUrl.searchParams.get("q");
  if (!keyword) return NextResponse.json({ error: "Informe ?q=palavra-chave" }, { status: 400 });

  try {
    const result = await searchCjProducts(keyword);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CjNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 501 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro na CJ API" }, { status: 502 });
  }
}
