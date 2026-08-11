import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Entre na sua conta para comentar." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 500) : "";
  if (!comment) return NextResponse.json({ error: "Escreva um comentário." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const authorName = profile?.full_name || user.email?.split("@")[0] || "Vizinho(a) verde";

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("community_comments")
    .insert({ post_id: id, user_id: user.id, author_name: authorName, comment })
    .select()
    .single();

  if (error) {
    console.error("community comment insert failed", error);
    return NextResponse.json({ error: "Não foi possível comentar agora." }, { status: 500 });
  }

  return NextResponse.json(data);
}
