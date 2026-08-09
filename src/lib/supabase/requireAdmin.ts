import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Confirma que a requisição vem de um admin logado. Use no início de toda rota de API que escreve dados. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
