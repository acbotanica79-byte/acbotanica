import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  if (error && error.code !== "23505") {
    console.error("newsletter insert failed", error);
    return NextResponse.json({ error: "Não foi possível cadastrar agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
