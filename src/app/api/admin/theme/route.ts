import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidHexColor } from "@/lib/theme";

const COLOR_FIELDS = {
  verdeEscuro: "verde_escuro",
  verdeMusgo: "verde_musgo",
  verdeClaro: "verde_claro",
  areia: "areia",
  terracota: "terracota",
  dourado: "dourado",
} as const;

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const update: Record<string, string | number | null> = {};

  for (const [key, column] of Object.entries(COLOR_FIELDS)) {
    if (key in body) {
      if (!isValidHexColor(body[key])) {
        return NextResponse.json({ error: `Cor inválida para ${key} (use #RRGGBB).` }, { status: 400 });
      }
      update[column] = body[key];
    }
  }

  if ("heroImageUrl" in body) update.hero_image_url = typeof body.heroImageUrl === "string" ? body.heroImageUrl || null : null;
  if ("heroHeadline" in body) update.hero_headline = typeof body.heroHeadline === "string" ? body.heroHeadline || null : null;
  if ("heroSubheadline" in body) update.hero_subheadline = typeof body.heroSubheadline === "string" ? body.heroSubheadline || null : null;
  if ("logoUrl" in body) update.logo_url = typeof body.logoUrl === "string" ? body.logoUrl || null : null;
  if ("whatsappNumber" in body) update.whatsapp_number = typeof body.whatsappNumber === "string" ? body.whatsappNumber || null : null;
  if ("phoneDisplay" in body) update.phone_display = typeof body.phoneDisplay === "string" ? body.phoneDisplay || null : null;
  if ("contactEmail" in body) update.contact_email = typeof body.contactEmail === "string" ? body.contactEmail || null : null;
  if ("freeShippingThreshold" in body) {
    const value = Number(body.freeShippingThreshold);
    if (!(value >= 0)) return NextResponse.json({ error: "Valor de frete grátis inválido." }, { status: 400 });
    update.free_shipping_threshold = value;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para salvar." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_theme")
    .upsert({ id: 1, ...update, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
