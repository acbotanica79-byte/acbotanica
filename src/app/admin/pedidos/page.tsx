import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  novo: "Novo",
  comprado: "Comprado do fornecedor",
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

export default async function AdminPedidosPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .neq("status", "aguardando_pagamento")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Pedidos</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">{orders?.length ?? 0} pedidos pagos/recebidos</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Cidade</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Data</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-verde-claro/10 last:border-0">
                <td className="p-4 font-medium text-verde-escuro">{o.order_number}</td>
                <td className="p-4 text-verde-escuro/80">{o.customer_name}</td>
                <td className="p-4 text-verde-escuro/70">
                  {o.shipping_city}/{o.shipping_uf}
                </td>
                <td className="p-4 font-medium text-verde-escuro">{formatPrice(Number(o.total))}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[o.status] ?? ""}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td className="p-4 text-verde-escuro/60">
                  {new Date(o.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-sm font-semibold text-verde-musgo hover:text-verde-escuro">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-verde-escuro/50">
                  Nenhum pedido pago ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
