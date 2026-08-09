import { redirect } from "next/navigation";
import { LogOut, User, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProfileForm, { ProfileData } from "@/components/conta/ProfileForm";
import UserOrders from "@/components/conta/UserOrders";
import SignOutButton from "@/components/conta/SignOutButton";

export const metadata = {
  title: "Painel do Cliente | ACCFG Botânica",
  robots: { index: false, follow: false },
};

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/conta");
  }

  const { tab } = await searchParams;
  const currentTab = tab === "pedidos" ? "pedidos" : "dados";

  // Buscar perfil
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    // Fallback if trigger hasn't fired yet or failed
    profile = {
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || null,
      email: session.user.email || null,
      cpf: null,
      phone: null,
    };
  }

  // Buscar pedidos
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .order("created_at", { ascending: false });
    // Note: RLS ensures user only sees their own orders

  return (
    <div className="container-px mx-auto max-w-[1000px] py-10 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
            Olá, {profile.full_name?.split(" ")[0] || "Cliente"}
          </h1>
          <p className="mt-1 text-sm text-verde-escuro/60">
            Bem-vindo ao seu painel. Aqui você gerencia seus dados e acompanha suas compras.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Menu lateral / Tabs */}
        <div className="flex shrink-0 flex-row gap-2 overflow-x-auto pb-2 md:w-64 md:flex-col md:pb-0 [scrollbar-width:none]">
          <a
            href="?tab=dados"
            className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              currentTab === "dados"
                ? "bg-verde-escuro text-areia"
                : "text-verde-escuro hover:bg-verde-claro/20"
            }`}
          >
            <User size={16} /> Meus Dados
          </a>
          <a
            href="?tab=pedidos"
            className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              currentTab === "pedidos"
                ? "bg-verde-escuro text-areia"
                : "text-verde-escuro hover:bg-verde-claro/20"
            }`}
          >
            <Package size={16} /> Meus Pedidos
          </a>
        </div>

        {/* Área Principal */}
        <div className="flex-1 rounded-3xl border border-verde-claro/30 bg-branco p-6 sm:p-8 shadow-[0_4px_24px_rgba(27,67,50,0.03)]">
          {currentTab === "dados" ? (
            <ProfileForm initialData={profile as ProfileData} />
          ) : (
            <UserOrders orders={orders || []} />
          )}
        </div>
      </div>
    </div>
  );
}
