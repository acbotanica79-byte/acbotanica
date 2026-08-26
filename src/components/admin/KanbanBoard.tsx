"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, Radio } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { AdminOrder } from "./PedidosClient";

const COLUMNS: { status: string; label: string; accent: string }[] = [
  { status: "aguardando_pagamento", label: "Aguardando pagamento", accent: "bg-verde-escuro/30" },
  { status: "novo", label: "Novo", accent: "bg-terracota" },
  { status: "comprado", label: "Comprado", accent: "bg-dourado" },
  { status: "enviado", label: "Enviado", accent: "bg-verde-claro" },
  { status: "entregue", label: "Entregue", accent: "bg-verde-musgo" },
  { status: "cancelado", label: "Cancelado", accent: "bg-red-400" },
];

export default function KanbanBoard({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [items, setItems] = useState(orders);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  // Tempo real: se um pedido novo chegar (pagamento confirmado) ou outra pessoa
  // mover um card, o board de todo mundo atualiza sozinho, sem precisar dar F5.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders-kanban")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string })?.id;
            setItems((prev) => prev.filter((o) => o.id !== oldId));
            return;
          }
          const incoming = payload.new as AdminOrder;
          setItems((prev) => {
            const exists = prev.some((o) => o.id === incoming.id);
            if (exists) return prev.map((o) => (o.id === incoming.id ? { ...o, ...incoming } : o));
            return [incoming, ...prev];
          });
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function moveOrder(orderId: string, newStatus: string) {
    const previous = items;
    setItems((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setPendingId(orderId);

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setPendingId(null);
    if (!res.ok) {
      setItems(previous); // reverte se der erro
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-verde-escuro/50">
        <Radio size={12} className={live ? "text-verde-musgo" : "text-verde-escuro/30"} />
        {live ? "Atualizando em tempo real" : "Conectando..."}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
      {COLUMNS.map((col) => {
        const columnOrders = items.filter((o) => o.status === col.status);
        const isOver = overStatus === col.status;
        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus(col.status);
            }}
            onDragLeave={() => setOverStatus((s) => (s === col.status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setOverStatus(null);
              if (dragId) moveOrder(dragId, col.status);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-branco/60 transition-colors ${
              isOver ? "border-verde-musgo bg-verde-claro/10" : "border-verde-claro/30"
            }`}
          >
            <div className="flex items-center gap-2 px-4 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${col.accent}`} />
              <h3 className="text-sm font-semibold text-verde-escuro">{col.label}</h3>
              <span className="ml-auto rounded-full bg-verde-escuro/10 px-2 py-0.5 text-[11px] font-semibold text-verde-escuro/60">
                {columnOrders.length}
              </span>
            </div>
            <div className="flex min-h-[80px] flex-1 flex-col gap-2 px-2.5 pb-3">
              {columnOrders.map((o) => (
                <div
                  key={o.id}
                  draggable
                  onDragStart={() => setDragId(o.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`cursor-grab rounded-xl border border-verde-claro/25 bg-branco p-3 shadow-sm active:cursor-grabbing ${
                    pendingId === o.id ? "opacity-50" : ""
                  } ${dragId === o.id ? "opacity-30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-verde-escuro">{o.order_number}</p>
                      <p className="truncate text-xs text-verde-escuro/60">{o.customer_name}</p>
                    </div>
                    <GripVertical size={14} className="mt-0.5 shrink-0 text-verde-escuro/25" />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-verde-escuro">{formatPrice(Number(o.total))}</span>
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="text-xs font-semibold text-verde-musgo hover:text-verde-escuro"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              ))}
              {columnOrders.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-verde-escuro/35">Nenhum pedido aqui</p>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
