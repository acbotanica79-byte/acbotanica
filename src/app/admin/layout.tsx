import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/constants";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen bg-areia">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-areia">
      <header className="border-b border-verde-claro/25 bg-verde-escuro text-areia">
        <div className="container-px mx-auto flex max-w-[1600px] items-center justify-between py-4">
          <Link href="/admin" className="font-display text-lg font-semibold">
            {SITE_NAME} · Admin
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/admin" className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-branco/10">
              <LayoutDashboard size={16} /> <span className="hidden sm:inline">Início</span>
            </Link>
            <Link href="/admin/produtos" className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-branco/10">
              <Package size={16} /> <span className="hidden sm:inline">Produtos</span>
            </Link>
            <Link href="/admin/pedidos" className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-branco/10">
              <ShoppingBag size={16} /> <span className="hidden sm:inline">Pedidos</span>
            </Link>
            <AdminSignOutButton />
          </nav>
        </div>
      </header>
      <main className="container-px mx-auto max-w-[1600px] py-8">{children}</main>
    </div>
  );
}
