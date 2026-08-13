import { createAdminClient } from "@/lib/supabase/admin";
import PedidosClient, { type AdminOrder, type AdminOrderItem } from "@/components/admin/PedidosClient";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatuses = ["todos", "aguardando_pagamento", "novo", "comprado", "enviado", "entregue", "cancelado"] as const;
  type StatusTab = (typeof validStatuses)[number];
  const initialStatus: StatusTab = validStatuses.includes(status as StatusTab)
    ? (status as StatusTab)
    : "todos";

  const supabase = createAdminClient();

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, shipping_city, shipping_uf, total, subtotal, shipping_price, status, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("order_items")
      .select("order_id, supplier_cost, quantity"),
  ]);

  return (
    <PedidosClient
      orders={(orders ?? []) as AdminOrder[]}
      items={(items ?? []) as AdminOrderItem[]}
      initialStatus={initialStatus}
    />
  );
}
