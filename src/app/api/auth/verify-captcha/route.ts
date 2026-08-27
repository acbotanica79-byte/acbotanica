import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const secret = await getSetting("TURNSTILE_SECRET_KEY");
  // Sem chave configurada, o CAPTCHA está desligado — deixa passar.
  if (!secret) return NextResponse.json({ success: true });

  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  if (!token) return NextResponse.json({ success: false, error: "Token ausente." }, { status: 400 });

  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token }),
  });
  const verifyData = await verifyRes.json();

  return NextResponse.json({ success: Boolean(verifyData.success) });
}
