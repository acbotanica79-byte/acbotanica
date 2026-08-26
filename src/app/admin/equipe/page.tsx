import { createAdminClient } from "@/lib/supabase/admin";
import TeamClient from "@/components/admin/TeamClient";

export default async function AdminEquipePage() {
  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("admin_users")
    .select("id, created_at")
    .order("created_at", { ascending: true });

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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Equipe</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">
        Convide outras pessoas para terem acesso ao painel administrativo. O convite chega por e-mail
        com um link de acesso — ao clicar, a pessoa já entra direto como admin.
      </p>
      <div className="mt-6 max-w-2xl">
        <TeamClient initialTeam={team} />
      </div>
    </div>
  );
}
