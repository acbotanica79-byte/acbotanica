import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!imageUrl || !title) {
    return NextResponse.json({ error: "Imagem e título são obrigatórios." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_banners")
    .insert({
      image_url: imageUrl,
      title,
      subtitle: typeof body?.subtitle === "string" ? body.subtitle : "",
      cta_label: typeof body?.ctaLabel === "string" && body.ctaLabel.trim() ? body.ctaLabel.trim() : "Ver mais",
      href: typeof body?.href === "string" && body.href.trim() ? body.href.trim() : "/produtos",
      sort_order: typeof body?.sortOrder === "number" ? body.sortOrder : 0,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
