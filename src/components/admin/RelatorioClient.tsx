"use client";

import { useState, useMemo } from "react";
import { Download, TrendingUp, Wallet, ShoppingBag, Percent } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MP_FEE = 0.05;

export type ReportOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  shipping_city: string;
  shipping_uf: string;
  total: number | string;
  subtotal: number | string;
  shipping_price: number | string;
  status: string;
  created_at: string;
};

export type ReportItem = {
  order_id: string;
  product_name: string;
  supplier_cost: number | null;
  quantity: number;
  unit_price: number | string;
};

const PERIOD_OPTIONS = [
  { label: "Este mês", value: "month" },
  { label: "Últimos 30 dias", value: "30days" },
  { label: "Últimos 90 dias", value: "90days" },
  { label: "Este ano", value: "year" },
  { label: "Todos", value: "all" },
  { label: "Personalizado", value: "custom" },
] as const;
type Period = (typeof PERIOD_OPTIONS)[number]["value"];

function filterByPeriod(orders: ReportOrder[], period: Period, customFrom: string, customTo: string): ReportOrder[] {
  const now = new Date();
  if (period === "all") return orders;
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter((o) => new Date(o.created_at) >= start);
  }
  if (period === "30days") {
    const start = new Date(Date.now() - 30 * 86400000);
    return orders.filter((o) => new Date(o.created_at) >= start);
  }
  if (period === "90days") {
    const start = new Date(Date.now() - 90 * 86400000);
    return orders.filter((o) => new Date(o.created_at) >= start);
  }
  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return orders.filter((o) => new Date(o.created_at) >= start);
  }
  if (period === "custom") {
    const start = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
    const end = customTo ? new Date(`${customTo}T23:59:59`) : null;
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }
  return orders;
}

export default function RelatorioClient({
  orders,
  items,
}: {
  orders: ReportOrder[];
  items: ReportItem[];
}) {
  const [period, setPeriod] = useState<Period>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const filtered = useMemo(
    () => filterByPeriod(orders, period, customFrom, customTo),
    [orders, period, customFrom, customTo]
  );

  const costByOrder = useMemo(() => {
    const map: Record<string, { total: number; missing: number }> = {};
    for (const item of items) {
      if (!map[item.order_id]) map[item.order_id] = { total: 0, missing: 0 };
      if (item.supplier_cost != null) {
        map[item.order_id].total += Number(item.supplier_cost) * item.quantity;
      } else {
        map[item.order_id].missing += 1;
      }
    }
    return map;
  }, [items]);

  const summary = useMemo(() => {
    let revenue = 0;
    let subtotalSum = 0;
    let supplierCost = 0;
    let mpFeeTotal = 0;
    let shippingTotal = 0;

    for (const o of filtered) {
      const total = Number(o.total);
      const subtotal = Number(o.subtotal ?? o.total);
      const shipping = Number(o.shipping_price ?? 0);
      revenue += total;
      subtotalSum += subtotal;
      shippingTotal += shipping;
      mpFeeTotal += total * MP_FEE;
      supplierCost += costByOrder[o.id]?.total ?? 0;
    }

    const profit = subtotalSum - supplierCost - mpFeeTotal;
    const margin = subtotalSum > 0 ? (profit / subtotalSum) * 100 : 0;
    return { revenue, subtotalSum, supplierCost, mpFeeTotal, shippingTotal, profit, margin };
  }, [filtered, costByOrder]);

  const filteredOrderIds = useMemo(() => new Set(filtered.map((o) => o.id)), [filtered]);

  const productCommission = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; cost: number; commission: number; missing: number }> = {};
    for (const item of items) {
      if (!filteredOrderIds.has(item.order_id)) continue;
      const key = item.product_name;
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0, cost: 0, commission: 0, missing: 0 };
      const revenue = Number(item.unit_price) * item.quantity;
      map[key].qty += item.quantity;
      map[key].revenue += revenue;
      if (item.supplier_cost != null) {
        const cost = Number(item.supplier_cost) * item.quantity;
        map[key].cost += cost;
        map[key].commission += revenue - cost;
      } else {
        map[key].missing += 1;
      }
    }
    return Object.values(map).sort((a, b) => b.commission - a.commission);
  }, [items, filteredOrderIds]);

  function exportCSV() {
    const header = ["Pedido", "Cliente", "Cidade/UF", "Status", "Data", "Total Cliente", "Custo Fornecedor", "Taxa MP (est.)", "Lucro Estimado", "Margem %"];
    const rows = filtered.map((o) => {
      const total = Number(o.total);
      const subtotal = Number(o.subtotal ?? o.total);
      const cost = costByOrder[o.id];
      const supplierCost = cost?.total ?? 0;
      const mpFee = total * MP_FEE;
      const profit = cost ? subtotal - supplierCost - mpFee : null;
      const margin = subtotal > 0 && profit !== null ? ((profit / subtotal) * 100).toFixed(1) : "";
      return [
        o.order_number,
        o.customer_name,
        `${o.shipping_city}/${o.shipping_uf}`,
        o.status,
        new Date(o.created_at).toLocaleDateString("pt-BR"),
        total.toFixed(2).replace(".", ","),
        supplierCost.toFixed(2).replace(".", ","),
        mpFee.toFixed(2).replace(".", ","),
        profit !== null ? profit.toFixed(2).replace(".", ",") : "",
        margin,
      ].join(";");
    });
    const csv = [header.join(";"), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-accfg-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-verde-escuro">Relatório Financeiro</h1>
          <p className="mt-1 text-sm text-verde-escuro/60">{filtered.length} pedidos no período</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-full border border-verde-claro/40 bg-branco p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  period === opt.value
                    ? "bg-verde-escuro text-areia"
                    : "text-verde-escuro/60 hover:text-verde-escuro"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-full border border-verde-claro/40 bg-branco px-3 py-1.5 text-xs text-verde-escuro outline-none focus:border-verde-musgo"
              />
              <span className="text-xs text-verde-escuro/50">até</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-full border border-verde-claro/40 bg-branco px-3 py-1.5 text-xs text-verde-escuro outline-none focus:border-verde-musgo"
              />
            </div>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-full bg-verde-musgo px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-escuro transition-colors"
          >
            <Download size={15} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="flex items-center gap-2 text-sm text-verde-escuro/60">
            <TrendingUp size={15} className="text-verde-musgo" /> Faturamento bruto
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-verde-escuro">{formatPrice(summary.revenue)}</p>
          <p className="mt-1 text-xs text-verde-escuro/50">Inclui frete ({formatPrice(summary.shippingTotal)})</p>
        </div>
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="flex items-center gap-2 text-sm text-verde-escuro/60">
            <ShoppingBag size={15} className="text-terracota" /> Custo fornecedores
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-verde-escuro">{formatPrice(summary.supplierCost)}</p>
          <p className="mt-1 text-xs text-verde-escuro/50">+ Taxa MP est. {formatPrice(summary.mpFeeTotal)}</p>
        </div>
        <div className="rounded-2xl border border-verde-musgo/30 bg-verde-musgo/5 p-6">
          <div className="flex items-center gap-2 text-sm text-verde-escuro/60">
            <Wallet size={15} className="text-verde-musgo" /> Lucro líquido est.
          </div>
          <p className={`mt-3 font-display text-2xl font-semibold ${summary.profit >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
            {formatPrice(summary.profit)}
          </p>
          <p className="mt-1 text-xs text-verde-escuro/50">Após fornecedor + taxa MP</p>
        </div>
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-6">
          <div className="flex items-center gap-2 text-sm text-verde-escuro/60">
            <Percent size={15} className="text-dourado" /> Margem média
          </div>
          <p className={`mt-3 font-display text-2xl font-semibold ${summary.margin >= 0 ? "text-verde-escuro" : "text-terracota"}`}>
            {summary.margin.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-verde-escuro/50">Sobre produtos (sem frete)</p>
        </div>
      </div>

      {/* Comissão por produto */}
      <div className="overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <div className="p-4 border-b border-verde-claro/20">
          <h2 className="text-sm font-semibold text-verde-escuro">Comissão por produto</h2>
          <p className="mt-0.5 text-xs text-verde-escuro/50">Receita − custo do fornecedor, por produto vendido no período.</p>
        </div>
        <table className="w-full text-sm" style={{ minWidth: "600px" }}>
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="p-4">Produto</th>
              <th className="p-4 text-right">Qtd. vendida</th>
              <th className="p-4 text-right">Receita</th>
              <th className="p-4 text-right">Custo</th>
              <th className="p-4 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {productCommission.map((p) => (
              <tr key={p.name} className="border-b border-verde-claro/10 last:border-0 hover:bg-verde-escuro/[0.015]">
                <td className="p-4 text-verde-escuro">
                  {p.name}
                  {p.missing > 0 && <span className="ml-1 text-[10px] text-terracota">*</span>}
                </td>
                <td className="p-4 text-right text-verde-escuro/70">{p.qty}</td>
                <td className="p-4 text-right text-verde-escuro/70">{formatPrice(p.revenue)}</td>
                <td className="p-4 text-right text-verde-escuro/70">{formatPrice(p.cost)}</td>
                <td className="p-4 text-right">
                  <span className={`font-semibold ${p.commission >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
                    {formatPrice(p.commission)}
                  </span>
                </td>
              </tr>
            ))}
            {productCommission.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-verde-escuro/50">
                  Nenhuma venda de produto no período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {productCommission.some((p) => p.missing > 0) && (
          <p className="px-4 py-2 text-xs text-verde-escuro/40 border-t border-verde-claro/10">
            * Comissão parcial — algum item desse produto ainda não tem custo de fornecedor lançado.
          </p>
        )}
      </div>

      {/* Tabela detalhada */}
      <div className="overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <table className="w-full text-sm" style={{ minWidth: "800px" }}>
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Data</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-right">Custo</th>
              <th className="p-4 text-right">Taxa MP</th>
              <th className="p-4 text-right">Lucro</th>
              <th className="p-4 text-right">Margem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const total = Number(o.total);
              const subtotal = Number(o.subtotal ?? o.total);
              const cost = costByOrder[o.id];
              const supplierCost = cost?.total ?? 0;
              const mpFee = total * MP_FEE;
              const profit = cost ? subtotal - supplierCost - mpFee : null;
              const margin = profit !== null && subtotal > 0 ? (profit / subtotal) * 100 : null;

              const statusColors: Record<string, string> = {
                novo: "bg-terracota/15 text-terracota",
                comprado: "bg-dourado/20 text-verde-escuro",
                enviado: "bg-verde-claro/30 text-verde-escuro",
                entregue: "bg-verde-musgo/15 text-verde-musgo",
                cancelado: "bg-red-100 text-red-600",
              };

              return (
                <tr key={o.id} className="border-b border-verde-claro/10 last:border-0 hover:bg-verde-escuro/[0.015]">
                  <td className="p-4 font-medium text-verde-escuro">{o.order_number}</td>
                  <td className="p-4 text-verde-escuro/80">{o.customer_name}</td>
                  <td className="p-4 text-verde-escuro/60">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-verde-escuro">{formatPrice(total)}</td>
                  <td className="p-4 text-right text-verde-escuro/70">
                    {cost ? formatPrice(supplierCost) : <span className="text-verde-escuro/30 text-xs">—</span>}
                  </td>
                  <td className="p-4 text-right text-verde-escuro/70">{formatPrice(mpFee)}</td>
                  <td className="p-4 text-right">
                    {profit !== null ? (
                      <span className={`font-semibold ${profit >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
                        {formatPrice(profit)}
                        {cost?.missing ? <span className="text-[10px] text-terracota ml-1">*</span> : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-verde-escuro/30">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {margin !== null ? (
                      <span className={`text-xs font-semibold ${margin >= 20 ? "text-verde-musgo" : margin >= 0 ? "text-dourado" : "text-terracota"}`}>
                        {margin.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-xs text-verde-escuro/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-sm text-verde-escuro/50">
                  Nenhum pedido no período selecionado.
                </td>
              </tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t border-verde-claro/25 bg-verde-escuro/[0.02]">
                <td colSpan={4} className="p-4 text-sm font-semibold text-verde-escuro">
                  Total ({filtered.length} pedidos)
                </td>
                <td className="p-4 text-right font-semibold text-verde-escuro">{formatPrice(summary.revenue)}</td>
                <td className="p-4 text-right font-semibold text-verde-escuro">{formatPrice(summary.supplierCost)}</td>
                <td className="p-4 text-right font-semibold text-verde-escuro">{formatPrice(summary.mpFeeTotal)}</td>
                <td className="p-4 text-right">
                  <span className={`font-semibold ${summary.profit >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
                    {formatPrice(summary.profit)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className={`font-semibold ${summary.margin >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
                    {summary.margin.toFixed(0)}%
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
        {items.some((i) => i.supplier_cost == null) && (
          <p className="px-4 py-2 text-xs text-verde-escuro/40 border-t border-verde-claro/10">
            * Lucro parcial em pedidos onde nem todos os itens têm custo lançado. Preencha em Pedidos → detalhe para tornar exato.
          </p>
        )}
      </div>
    </div>
  );
}
