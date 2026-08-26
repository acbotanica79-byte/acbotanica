"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const KanbanCard = memo(function KanbanCard({
  order,
  isDragging,
  isPending,
  onDragStart,
  onDragEnd,
}: {
  order: AdminOrder;
  isDragging: boolean;
  isPending: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      data-id={order.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-xl border border-verde-claro/25 bg-branco p-3 shadow-sm active:cursor-grabbing ${
        isPending ? "opacity-50" : ""
      } ${isDragging ? "opacity-30" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-verde-escuro">{order.order_number}</p>
          <p className="truncate text-xs text-verde-escuro/60">{order.customer_name}</p>
        </div>
        <GripVertical size={14} className="mt-0.5 shrink-0 text-verde-escuro/25" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-verde-escuro">{formatPrice(Number(order.total))}</span>
        <Link href={`/admin/pedidos/${order.id}`} className="text-xs font-semibold text-verde-musgo hover:text-verde-escuro">
          Ver
        </Link>
      </div>
    </div>
  );
});

const KanbanColumn = memo(function KanbanColumn({
  column,
  columnOrders,
  isOver,
  dragId,
  pendingId,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
}: {
  column: (typeof COLUMNS)[number];
  columnOrders: AdminOrder[];
  isOver: boolean;
  dragId: string | null;
  pendingId: string | null;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardDragEnd: () => void;
}) {
  return (
    <div
      data-status={column.status}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-branco/60 transition-colors ${
        isOver ? "border-verde-musgo bg-verde-claro/10" : "border-verde-claro/30"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${column.accent}`} />
        <h3 className="text-sm font-semibold text-verde-escuro">{column.label}</h3>
        <span className="ml-auto rounded-full bg-verde-escuro/10 px-2 py-0.5 text-[11px] font-semibold text-verde-escuro/60">
          {columnOrders.length}
        </span>
      </div>
      <div className="flex min-h-[80px] flex-1 flex-col gap-2 px-2.5 pb-3">
        {columnOrders.map((o) => (
          <KanbanCard
            key={o.id}
            order={o}
            isDragging={dragId === o.id}
            isPending={pendingId === o.id}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
          />
        ))}
        {columnOrders.length === 0 && <p className="px-2 py-4 text-center text-xs text-verde-escuro/35">Nenhum pedido aqui</p>}
      </div>
    </div>
  );
});

export default function KanbanBoard({ orders }: { orders: AdminOrder[] }) {
  const [items, setItems] = useState(orders);
  // Ajusta o estado durante a renderização (padrão recomendado pelo React) em vez
  // de um efeito: quando o pai reenvia uma lista nova (ex: busca), o board
  // resincroniza sem disparar um render em cascata.
  const [prevOrders, setPrevOrders] = useState(orders);
  if (orders !== prevOrders) {
    setPrevOrders(orders);
    setItems(orders);
  }
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

  // Agrupa uma única vez por render (O(n)) em vez de filtrar o array inteiro
  // uma vez por coluna (O(n * colunas)).
  const grouped = useMemo(() => {
    const map = new Map<string, AdminOrder[]>();
    for (const col of COLUMNS) map.set(col.status, []);
    for (const o of items) {
      map.get(o.status)?.push(o);
    }
    return map;
  }, [items]);

  const moveOrder = useCallback(async (orderId: string, newStatus: string) => {
    setItems((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (!order || order.status === newStatus) return prev;
      return prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    });
    setPendingId(orderId);

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setPendingId(null);
    if (!res.ok) {
      // reverte usando o snapshot vindo do servidor via `orders`, evitando guardar
      // um segundo estado "previous" só para o caso de erro.
      setItems((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: orders.find((x) => x.id === orderId)?.status ?? o.status } : o)));
    }
    // Sem router.refresh(): o update otimista já refletiu a mudança e o canal
    // realtime confirma para todos os clientes — refazer o fetch da página
    // inteira a cada drag era redundante e causava um refetch/flicker desnecessário.
  }, [orders]);

  const handleCardDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const id = e.currentTarget.dataset.id;
    if (id) setDragId(id);
  }, []);

  const handleCardDragEnd = useCallback(() => setDragId(null), []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const status = e.currentTarget.dataset.status;
    if (status) setOverStatus(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const status = e.currentTarget.dataset.status;
    setOverStatus((s) => (s === status ? null : s));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const status = e.currentTarget.dataset.status;
      setOverStatus(null);
      if (dragId && status) moveOrder(dragId, status);
    },
    [dragId, moveOrder]
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-verde-escuro/50">
        <Radio size={12} className={live ? "text-verde-musgo" : "text-verde-escuro/30"} />
        {live ? "Atualizando em tempo real" : "Conectando..."}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            column={col}
            columnOrders={grouped.get(col.status) ?? []}
            isOver={overStatus === col.status}
            dragId={dragId}
            pendingId={pendingId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
