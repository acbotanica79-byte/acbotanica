"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_city: string;
  shipping_uf: string;
  total: number | string;
  subtotal: number | string;
  shipping_price: number | string;
  status: string;
  created_at: string;
};

export type AdminOrderItem = {
  order_id: string;
  supplier_cost: number | null;
  quantity: number;
};

const STATUS_LABEL: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  novo: "Novo",
  comprado: "Comprado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  aguardando_pagamento: "bg-verde-escuro/10 text-verde-escuro/60",
  novo: "bg-terracota/15 text-terracota",
  comprado: "bg-dourado/20 text-verde-escuro",
  enviado: "bg-verde-claro/30 text-verde-escuro",
  entregue: "bg-verde-musgo/15 text-verde-musgo",
  cancelado: "bg-red-100 text-red-600",
};

const STATUS_TABS = ["todos", "aguardando_pagamento", "novo", "comprado", "enviado", "entregue", "cancelado"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const MP_FEE = 0.05;

export default function PedidosClient({
  orders,
  items,
  initialStatus,
}: {
  orders: AdminOrder[];
  items: AdminOrderItem[];
  initialStatus: StatusTab;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<StatusTab>(initialStatus);

  // Build cost map by order_id
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

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === "todos") list = list.filter((o) => o.status !== "aguardando_pagamento");
    else list = list.filter((o) => o.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, tab, search]);

  const tabCounts = useMemo(() => {
    const c: Record<string, number> = { todos: 0 };
    for (const o of orders) {
      c[o.status] = (c[o.status] ?? 0) + 1;
      if (o.status !== "aguardando_pagamento") c.todos += 1;
    }
    return c;
  }, [orders]);

  const paidOrdersCount = orders.filter((o) => o.status !== "aguardando_pagamento").length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-verde-escuro">Pedidos</h1>
          <p className="mt-1 text-sm text-verde-escuro/60">{paidOrdersCount} pedidos pagos/recebidos</p>
        </div>
        {/* Busca */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-verde-escuro/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido ou cliente..."
            className="w-full rounded-full border border-verde-claro/50 bg-branco py-2.5 pl-9 pr-4 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
      </div>

      {/* Tabs de status */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === s
                ? "bg-verde-escuro text-areia"
                : "bg-verde-escuro/[0.06] text-verde-escuro/70 hover:bg-verde-escuro/10"
            }`}
          >
            {STATUS_LABEL[s] ?? "Todos"}
            {tabCounts[s] != null && (
              <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${tab === s ? "bg-areia/20" : "bg-verde-escuro/10"}`}>
                {tabCounts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tabela — scroll horizontal em mobile */}
      <div className="overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <table className="w-full text-sm" style={{ minWidth: "700px" }}>
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4 hidden md:table-cell">Cidade</th>
              <th className="p-4">Recebido</th>
              <th className="p-4">Lucro est.</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden sm:table-cell">Data</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const cost = costByOrder[o.id];
              const subtotal = Number(o.subtotal ?? o.total);
              const supplierCost = cost?.total ?? 0;
              const mpFee = Number(o.total) * MP_FEE;
              const profit = cost ? subtotal - supplierCost - mpFee : null;

              return (
                <tr key={o.id} className="border-b border-verde-claro/10 last:border-0 hover:bg-verde-escuro/[0.02]">
                  <td className="p-4 font-medium text-verde-escuro">{o.order_number}</td>
                  <td className="p-4 text-verde-escuro/80">
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-verde-escuro/50">{o.customer_email}</p>
                  </td>
                  <td className="p-4 text-verde-escuro/70 hidden md:table-cell">
                    {o.shipping_city}/{o.shipping_uf}
                  </td>
                  <td className="p-4 font-semibold text-verde-escuro">{formatPrice(Number(o.total))}</td>
                  <td className="p-4">
                    {profit !== null ? (
                      <span className={`font-semibold ${profit >= 0 ? "text-verde-musgo" : "text-terracota"}`}>
                        {formatPrice(profit)}
                        {cost?.missing ? <span className="ml-1 text-[10px] text-terracota">*</span> : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-verde-escuro/40">Lançar custo</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[o.status] ?? ""}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="p-4 text-verde-escuro/60 hidden sm:table-cell">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-verde-musgo hover:text-verde-escuro"
                    >
                      Ver <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-verde-escuro/50">
                  {search ? "Nenhum pedido encontrado para essa busca." : "Nenhum pedido neste status."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {Object.values(costByOrder).some((c) => c.missing > 0) && (
          <p className="px-4 py-2 text-xs text-verde-escuro/40 border-t border-verde-claro/10">
            * Lucro parcial — alguns itens ainda não têm custo de fornecedor lançado.
          </p>
        )}
      </div>
    </div>
  );
}
