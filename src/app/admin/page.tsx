import Link from "next/link";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomePage() {
  const supabase = createAdminClient();

  const [{ count: productCount }, { count: newOrdersCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "novo"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Painel</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">Visão geral da loja.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/pedidos"
          className="flex items-center justify-between rounded-2xl border border-verde-claro/30 bg-branco p-6 transition-colors hover:border-verde-musgo"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracota/10 text-terracota">
              <ShoppingBag size={22} />
            </span>
            <div>
              <p className="text-2xl font-semibold text-verde-escuro">{newOrdersCount ?? 0}</p>
              <p className="text-sm text-verde-escuro/60">Pedidos novos</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-verde-escuro/40" />
        </Link>

        <Link
          href="/admin/produtos"
          className="flex items-center justify-between rounded-2xl border border-verde-claro/30 bg-branco p-6 transition-colors hover:border-verde-musgo"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-musgo/10 text-verde-musgo">
              <Package size={22} />
            </span>
            <div>
              <p className="text-2xl font-semibold text-verde-escuro">{productCount ?? 0}</p>
              <p className="text-sm text-verde-escuro/60">Produtos cadastrados</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-verde-escuro/40" />
        </Link>
      </div>
    </div>
  );
}
