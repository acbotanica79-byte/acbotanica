import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, BarChart3, Truck } from "lucide-react";
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

  const navItems = [
    { href: "/admin", label: "Início", icon: LayoutDashboard, exact: true },
    { href: "/admin/produtos", label: "Produtos", icon: Package },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
    { href: "/admin/relatorio", label: "Relatório", icon: BarChart3 },
    { href: "/admin/fornecedores", label: "Fornecedores", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-areia">
      <header className="sticky top-0 z-40 border-b border-verde-claro/25 bg-verde-escuro text-areia">
        <div className="container-px mx-auto flex max-w-[1600px] items-center justify-between py-3 gap-3">
          <Link href="/admin" className="font-display text-base font-semibold shrink-0 sm:text-lg">
            {SITE_NAME}
            <span className="ml-2 rounded-md bg-areia/15 px-2 py-0.5 text-xs font-semibold tracking-wide">ADMIN</span>
          </Link>
          <nav className="flex items-center gap-0.5 text-sm overflow-x-auto [scrollbar-width:none]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 hover:bg-branco/10 transition-colors"
              >
                <item.icon size={15} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <AdminSignOutButton />
          </nav>
        </div>
      </header>
      <main className="container-px mx-auto max-w-[1600px] py-8">{children}</main>
    </div>
  );
}
