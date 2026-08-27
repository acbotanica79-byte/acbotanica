import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { generatePkce, getCanvaAuthorizeUrl } from "@/lib/canva";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.redirect(`${SITE_URL}/admin/login`);

  let authorizeUrl: string;
  const { verifier, challenge } = generatePkce();
  const state = crypto.randomBytes(16).toString("hex");

  try {
    authorizeUrl = await getCanvaAuthorizeUrl(challenge, state);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao montar URL de autorização.";
    return NextResponse.redirect(`${SITE_URL}/admin/integracoes?canva_error=${encodeURIComponent(message)}`);
  }

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
