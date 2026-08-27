import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { isCanvaConnected } from "@/lib/canva";
import { getSettingSource } from "@/lib/settings";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const [connected, templateSource] = await Promise.all([
    isCanvaConnected(),
    getSettingSource("CANVA_BRAND_TEMPLATE_ID"),
  ]);

  return NextResponse.json({ connected, hasTemplate: templateSource !== "nao_configurado" });
}
