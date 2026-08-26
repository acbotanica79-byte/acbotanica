import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { SETTABLE_KEYS, SettableKey, getSettingSource, saveSetting } from "@/lib/settings";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const status = await Promise.all(
    SETTABLE_KEYS.map(async (key) => ({ key, source: await getSettingSource(key) }))
  );

  return NextResponse.json({ status });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const key = body?.key as SettableKey | undefined;
  const value = body?.value?.trim();

  if (!key || !SETTABLE_KEYS.includes(key)) {
    return NextResponse.json({ error: "Chave inválida." }, { status: 400 });
  }
  if (!value) {
    return NextResponse.json({ error: "Valor é obrigatório." }, { status: 400 });
  }

  await saveSetting(key, value);
  return NextResponse.json({ ok: true });
}
