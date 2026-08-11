import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Entre na sua conta para postar." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  const caption = typeof body?.caption === "string" ? body.caption.trim().slice(0, 500) : "";

  if (!imageUrl) return NextResponse.json({ error: "Foto obrigatória." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const authorName = profile?.full_name || user.email?.split("@")[0] || "Vizinho(a) verde";

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("community_posts")
    .insert({ user_id: user.id, author_name: authorName, image_url: imageUrl, caption: caption || null })
    .select()
    .single();

  if (error) {
    console.error("community post insert failed", error);
    return NextResponse.json({ error: "Não foi possível publicar agora." }, { status: 500 });
  }

  return NextResponse.json(data);
}
