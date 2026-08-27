import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { generatePkce, getCanvaAuthorizeUrl } from "@/lib/canva";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { verifier, challenge } = generatePkce();
  const state = crypto.randomBytes(16).toString("hex");

  const authorizeUrl = await getCanvaAuthorizeUrl(challenge, state);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set("canva_pkce_verifier", verifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  res.cookies.set("canva_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
