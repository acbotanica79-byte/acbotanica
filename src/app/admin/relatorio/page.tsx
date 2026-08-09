import { createAdminClient } from "@/lib/supabase/admin";
import RelatorioClient, { type ReportOrder, type ReportItem } from "@/components/admin/RelatorioClient";

export const metadata = { title: "Relatório Financeiro" };

export default async function AdminRelatorioPage() {
  const supabase = createAdminClient();

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, customer_name, shipping_city, shipping_uf, total, subtotal, shipping_price, status, created_at")
      .neq("status", "aguardando_pagamento")
      .order("created_at", { ascending: false }),

    supabase
      .from("order_items")
      .select("order_id, product_name, supplier_cost, quantity, unit_price"),
  ]);

  return (
    <RelatorioClient
      orders={(orders ?? []) as ReportOrder[]}
      items={(items ?? []) as ReportItem[]}
    />
  );
}
