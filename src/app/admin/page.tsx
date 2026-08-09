import Link from "next/link";
import { Package, ShoppingBag, ArrowRight, TrendingUp, Wallet, AlertTriangle, BarChart3, Clock, CheckCircle2, Truck, Star } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

const MP_FEE = 0.05;

// Build last-7-days array (YYYY-MM-DD)
function getLast7Days(): { date: string; label: string }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
    });
  }
  return days;
}

export default async function AdminHomePage() {
  const supabase = createAdminClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: productCount },
    { data: monthOrders },
    { data: statusCounts },
    { data: allItems },
    { data: alertOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),

    // Pedidos pagos no mês atual (todos os status exceto aguardando)
    supabase
      .from("orders")
      .select("id, total, subtotal, created_at, status")
      .neq("status", "aguardando_pagamento")
      .neq("status", "cancelado")
      .gte("created_at", startOfMonth),

    // Contagem por status
    supabase
      .from("orders")
      .select("status")
      .neq("status", "aguardando_pagamento"),

    // Itens com custo de fornecedor (para calcular lucro)
    supabase
      .from("order_items")
      .select("order_id, supplier_cost, quantity, unit_price"),

    // Pedidos "novo" criados há mais de 24h sem ação
    supabase
      .from("orders")
      .select("id, order_number, customer_name, created_at")
      .eq("status", "novo")
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })
      .limit(5),

    // Últimos 7 dias com data de criação (para o gráfico)
    supabase
      .from("orders")
      .select("created_at, total")
      .neq("status", "aguardando_pagamento")
      .neq("status", "cancelado")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // KPIs mensais
  const monthRevenue = (monthOrders ?? []).reduce((s, o) => s + Number(o.total), 0);
  const monthOrderCount = (monthOrders ?? []).length;
  const ticketMedio = monthOrderCount > 0 ? monthRevenue / monthOrderCount : 0;

  // Lucro: precisa cruzar items com orders do mês
  const monthOrderIds = new Set((monthOrders ?? []).map((o) => o.id));
  const monthItems = (allItems ?? []).filter((i) => monthOrderIds.has(i.order_id));
  const totalSupplierCost = monthItems.reduce(
    (s, i) => s + (i.supplier_cost != null ? Number(i.supplier_cost) * i.quantity : 0),
    0
  );
  const monthSubtotal = (monthOrders ?? []).reduce((s, o) => s + Number(o.subtotal ?? o.total), 0);
  const mpFee = monthRevenue * MP_FEE;
  const estimatedProfit = monthSubtotal - totalSupplierCost - mpFee;
  const marginPct = monthSubtotal > 0 ? (estimatedProfit / monthSubtotal) * 100 : 0;
  const itemsWithoutCost = monthItems.filter((i) => i.supplier_cost == null).length;

  // Status distribution
  const allPaidOrders = statusCounts ?? [];
  const countByStatus = allPaidOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Gráfico últimos 7 dias
  const days = getLast7Days();
  const ordersByDay = days.map(({ date, label }) => {
    const count = (recentOrders ?? []).filter((o) => o.created_at.slice(0, 10) === date).length;
    const revenue = (recentOrders ?? [])
      .filter((o) => o.created_at.slice(0, 10) === date)
      .reduce((s, o) => s + Number(o.total), 0);
    return { date, label, count, revenue };
  });
  const maxCount = Math.max(...ordersByDay.map((d) => d.count), 1);

  // Top produtos (dos items do mês)
  const productSales: Record<string, { name: string; slug: string; qty: number; revenue: number }> = {};
  for (const item of monthItems) {
    // We need name/slug — get from a join later; for now group by order_id placeholder
    // Items don't have product name in this query. We'll query order_items with name
  }
  // Re-query items with name for top products
  const { data: namedItems } = await supabase
    .from("order_items")
    .select("product_id, product_name, product_slug, unit_price, quantity")
    .in("order_id", Array.from(monthOrderIds).length > 0 ? Array.from(monthOrderIds) : ["00000000-0000-0000-0000-000000000000"]);

  const topMap: Record<string, { name: string; slug: string; qty: number; revenue: number }> = {};
  for (const item of namedItems ?? []) {
    const key = item.product_id ?? item.product_slug;
    if (!topMap[key]) topMap[key] = { name: item.product_name, slug: item.product_slug, qty: 0, revenue: 0 };
    topMap[key].qty += item.quantity;
    topMap[key].revenue += Number(item.unit_price) * item.quantity;
  }
  const topProducts = Object.values(topMap).sort((a, b) => b.qty - a.qty).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-verde-escuro">Painel</h1>
        <p className="mt-1 text-sm text-verde-escuro/60">
          Visão geral · {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Alertas */}
      {(alertOrders ?? []).length > 0 && (
        <div className="rounded-2xl border border-terracota/30 bg-terracota/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-terracota">
            <AlertTriangle size={16} />
            {alertOrders!.length} pedido{alertOrders!.length > 1 ? "s" : ""} aguardando ação há mais de 24h
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {alertOrders!.map((o) => (
              <Link
                key={o.id}
                href={`/admin/pedidos/${o.id}`}
                className="flex items-center justify-between rounded-xl bg-branco px-4 py-2.5 text-sm hover:border-terracota/40 border border-transparent transition-colors"
              >
                <span className="font-semibold text-verde-escuro">{o.order_number}</span>
                <span className="text-verde-escuro/60">{o.customer_name}</span>
                <span className="flex items-center gap-1 text-terracota">
                  <Clock size={13} />
                  {Math.floor((Date.now() - new Date(o.created_at).getTime()) / 3600000)}h atrás
                </span>
                <ArrowRight size={14} className="text-verde-escuro/40" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-verde-escuro/60">Faturamento (mês)</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-verde-musgo/10 text-verde-musgo">
              <TrendingUp size={17} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-verde-escuro">{formatPrice(monthRevenue)}</p>
          <p className="mt-1 text-xs text-verde-escuro/50">{monthOrderCount} pedidos pagos</p>
        </div>

        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-verde-escuro/60">Lucro estimado</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dourado/15 text-dourado">
              <Wallet size={17} />
            </span>
          </div>
          <p className={`mt-3 font-display text-2xl font-semibold ${estimatedProfit >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
            {formatPrice(estimatedProfit)}
          </p>
          <p className="mt-1 text-xs text-verde-escuro/50">
            Margem ~{marginPct.toFixed(0)}%
            {itemsWithoutCost > 0 && (
              <span className="ml-1 text-terracota">· {itemsWithoutCost} itens sem custo lançado</span>
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-verde-escuro/60">Ticket médio</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracota/10 text-terracota">
              <ShoppingBag size={17} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-verde-escuro">{formatPrice(ticketMedio)}</p>
          <p className="mt-1 text-xs text-verde-escuro/50">por pedido</p>
        </div>

        <Link
          href="/admin/produtos"
          className="rounded-2xl border border-verde-claro/30 bg-branco p-6 transition-colors hover:border-verde-musgo"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-verde-escuro/60">Produtos</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-verde-claro/20 text-verde-escuro">
              <Package size={17} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-verde-escuro">{productCount ?? 0}</p>
          <p className="mt-1 text-xs text-verde-escuro/50 flex items-center gap-1">Cadastrados <ArrowRight size={12} /></p>
        </Link>
      </div>

      {/* Gráfico + Status */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Gráfico de barras - últimos 7 dias */}
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 size={17} className="text-verde-musgo" />
            <p className="font-semibold text-verde-escuro">Pedidos — últimos 7 dias</p>
          </div>
          <div className="flex h-48 items-end gap-3">
            {ordersByDay.map(({ label, count, revenue }) => {
              const heightPct = maxCount > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 8 : 0) : 0;
              return (
                <div key={label} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    {count > 0 && (
                      <div
                        className="absolute -top-6 hidden rounded-lg bg-verde-escuro px-2 py-1 text-[11px] font-semibold text-areia group-hover:flex"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {count}× · {formatPrice(revenue)}
                      </div>
                    )}
                    <div
                      className="bar-animated w-full rounded-t-lg transition-all"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: count > 0 ? "var(--color-verde-musgo)" : "var(--color-verde-claro)",
                        opacity: count > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                  <span className="text-center text-[10px] text-verde-escuro/55 leading-tight">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status dos pedidos */}
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <p className="mb-5 font-semibold text-verde-escuro">Status dos pedidos</p>
          <div className="space-y-3">
            {[
              { key: "novo", label: "Novos", icon: ShoppingBag, color: "text-terracota bg-terracota/10" },
              { key: "comprado", label: "Comprado", icon: Package, color: "text-dourado bg-dourado/15" },
              { key: "enviado", label: "Enviado", icon: Truck, color: "text-verde-musgo bg-verde-musgo/10" },
              { key: "entregue", label: "Entregue", icon: CheckCircle2, color: "text-verde-escuro bg-verde-claro/20" },
            ].map(({ key, label, icon: Icon, color }) => (
              <Link
                key={key}
                href={`/admin/pedidos?status=${key}`}
                className="flex items-center justify-between rounded-xl border border-transparent px-4 py-3 hover:border-verde-claro/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${color}`}>
                    <Icon size={15} />
                  </span>
                  <span className="text-sm font-medium text-verde-escuro">{label}</span>
                </div>
                <span className="font-display text-lg font-semibold text-verde-escuro">
                  {countByStatus[key] ?? 0}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/admin/pedidos"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-verde-escuro/5 py-2.5 text-sm font-semibold text-verde-escuro hover:bg-verde-escuro/10 transition-colors"
          >
            Ver todos os pedidos <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Top Produtos + Quick Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top produtos */}
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="mb-5 flex items-center gap-2">
            <Star size={17} className="text-dourado" />
            <p className="font-semibold text-verde-escuro">Mais vendidos (mês)</p>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-verde-escuro/50">Nenhuma venda no mês ainda.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.slug} className="flex items-center gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-verde-escuro text-xs font-bold text-areia">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-verde-escuro">{p.name}</p>
                    <p className="text-xs text-verde-escuro/55">{p.qty} unidade{p.qty > 1 ? "s" : ""} · {formatPrice(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <p className="mb-5 font-semibold text-verde-escuro">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ver pedidos", href: "/admin/pedidos", icon: ShoppingBag, desc: "Processar compras" },
              { label: "Novo produto", href: "/admin/produtos/novo", icon: Package, desc: "Cadastrar item" },
              { label: "Relatório", href: "/admin/relatorio", icon: BarChart3, desc: "Financeiro detalhado" },
              { label: "Produtos", href: "/admin/produtos", icon: TrendingUp, desc: "Gerenciar catálogo" },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col gap-1 rounded-xl border border-verde-claro/30 p-4 hover:border-verde-musgo transition-colors group"
              >
                <Icon size={18} className="text-verde-musgo group-hover:text-verde-escuro transition-colors" />
                <p className="mt-1 text-sm font-semibold text-verde-escuro">{label}</p>
                <p className="text-xs text-verde-escuro/50">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
