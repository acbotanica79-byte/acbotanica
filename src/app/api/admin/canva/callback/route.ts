import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { exchangeCodeForToken } from "@/lib/canva";
import { SITE_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.redirect(`${SITE_URL}/admin/login`);

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const verifier = req.cookies.get("canva_pkce_verifier")?.value;
  const expectedState = req.cookies.get("canva_oauth_state")?.value;

  const redirectWithError = (message: string) =>
    NextResponse.redirect(`${SITE_URL}/admin/integracoes?canva_error=${encodeURIComponent(message)}`);

  if (!code || !verifier || !state || state !== expectedState) {
    console.error("Canva callback falhou", {
      hasCode: Boolean(code),
      hasVerifier: Boolean(verifier),
      hasState: Boolean(state),
      hasExpectedState: Boolean(expectedState),
      stateMatches: state === expectedState,
      allParams: Object.fromEntries(searchParams.entries()),
    });
    const canvaError = searchParams.get("error_description") || searchParams.get("error");
    return redirectWithError(
      canvaError ? `Canva recusou: ${canvaError}` : "Falha na autenticação com a Canva. Tente conectar novamente."
    );
  }

  try {
    await exchangeCodeForToken(code, verifier);
  } catch (err) {
    return redirectWithError(err instanceof Error ? err.message : "Erro desconhecido.");
  }

  const res = NextResponse.redirect(`${SITE_URL}/admin/integracoes?canva=conectado`);
  res.cookies.delete("canva_pkce_verifier");
  res.cookies.delete("canva_oauth_state");
  return res;
}
