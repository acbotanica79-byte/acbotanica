import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Confirma que a requisição vem de um admin logado (checa a tabela admin_users, não só a sessão). Use no início de toda rota de API que escreve dados. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return adminRow ? user : null;
}
