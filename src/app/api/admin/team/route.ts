import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("admin_users")
    .select("id, created_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const team = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data } = await supabase.auth.admin.getUserById(row.id);
      return {
        id: row.id,
        email: data?.user?.email ?? "(conta removida)",
        created_at: row.created_at,
      };
    })
  );

  return NextResponse.json({ team });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/admin`,
  });

  if (inviteError || !invited?.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? "Não foi possível enviar o convite." },
      { status: 500 }
    );
  }

  const { error: insertError } = await supabase
    .from("admin_users")
    .insert({ id: invited.user.id })
    .select()
    .single();

  if (insertError && insertError.code !== "23505") {
    // 23505 = já era admin (linha duplicada) — não é um erro real aqui.
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}
