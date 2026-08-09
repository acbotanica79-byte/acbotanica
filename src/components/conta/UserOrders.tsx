"use client";

import { Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type UserOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; icon: any; color: string }> = {
  aguardando_pagamento: { label: "Aguardando Pagamento", icon: AlertCircle, color: "text-terracota bg-terracota/10" },
  novo: { label: "Pagamento Confirmado", icon: CheckCircle2, color: "text-verde-escuro bg-verde-claro/20" },
  comprado: { label: "Em Separação", icon: Package, color: "text-dourado bg-dourado/15" },
  enviado: { label: "Enviado", icon: Truck, color: "text-verde-musgo bg-verde-musgo/10" },
  entregue: { label: "Entregue", icon: CheckCircle2, color: "text-verde-musgo bg-verde-musgo/20" },
  cancelado: { label: "Cancelado", icon: AlertCircle, color: "text-red-600 bg-red-100" },
};

export default function UserOrders({ orders }: { orders: UserOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-verde-claro/30 bg-branco py-16 px-4 text-center animate-fade-up">
        <Package size={48} className="text-verde-escuro/20 mb-4" />
        <h3 className="font-display text-lg font-semibold text-verde-escuro">Nenhum pedido encontrado</h3>
        <p className="mt-1 text-sm text-verde-escuro/60 max-w-sm">
          Você ainda não realizou nenhuma compra. Quando fizer, seus pedidos aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {orders.map((o) => {
        const st = STATUS_MAP[o.status] || { label: o.status, icon: Package, color: "bg-gray-100 text-gray-600" };
        const Icon = st.icon;
        
        return (
          <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-verde-claro/30 bg-branco p-5 transition-shadow hover:shadow-md hover:shadow-verde-escuro/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-verde-escuro">{o.order_number}</span>
                <span className="text-xs text-verde-escuro/40">·</span>
                <span className="text-sm text-verde-escuro/60">
                  {new Date(o.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="font-display text-lg font-semibold text-verde-escuro">
                {formatPrice(o.total)}
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 self-start sm:self-auto rounded-full px-3 py-1.5 text-xs font-semibold ${st.color}`}>
              <Icon size={14} />
              {st.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
