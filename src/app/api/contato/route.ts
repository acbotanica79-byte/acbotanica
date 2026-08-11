import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json({ error: "Preencha nome, e-mail e mensagem." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject: subject || null,
    message,
  });

  if (error) {
    console.error("contact insert failed", error);
    return NextResponse.json({ error: "Não foi possível enviar agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
