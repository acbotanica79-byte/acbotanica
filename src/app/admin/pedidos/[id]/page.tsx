import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MapPin, User, Package } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSuppliersForCategory } from "@/lib/data/suppliers";
import { formatPrice } from "@/lib/utils";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import OrderItemSupplier from "@/components/admin/OrderItemSupplier";

export default async function AdminPedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);

  const productIds = (items ?? []).map((i) => i.product_id).filter(Boolean);
  const { data: products } =
    productIds.length > 0
      ? await supabase.from("products").select("id, category_slug").in("id", productIds)
      : { data: [] };

  const categorySlugs = Array.from(new Set((products ?? []).map((p) => p.category_slug)));
  const supplierSuggestions = categorySlugs.flatMap((c) => getSuppliersForCategory(c));
  const uniqueSuppliers = Array.from(new Map(supplierSuggestions.map((s) => [s.name, s])).values());

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracota">Pedido</p>
          <h1 className="font-display text-2xl font-semibold text-verde-escuro">{order.order_number}</h1>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-verde-escuro">
            <User size={15} /> Cliente
          </p>
          <p className="mt-2 text-sm text-verde-escuro/80">{order.customer_name}</p>
          <p className="text-sm text-verde-escuro/60">{order.customer_email}</p>
          {order.customer_phone && <p className="text-sm text-verde-escuro/60">{order.customer_phone}</p>}
        </div>
        <div className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-verde-escuro">
            <MapPin size={15} /> Endereço de entrega
          </p>
          <p className="mt-2 text-sm text-verde-escuro/80">
            {order.shipping_address}, {order.shipping_number}
            {order.shipping_complement ? ` — ${order.shipping_complement}` : ""}
          </p>
          <p className="text-sm text-verde-escuro/60">
            {order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_uf}
          </p>
          <p className="text-sm text-verde-escuro/60">CEP {order.shipping_cep}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-verde-claro/30 bg-branco p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-verde-escuro">
          <Package size={15} /> Itens — compre e registre o fornecedor usado
        </p>
        <div className="mt-4 divide-y divide-verde-claro/15">
          {(items ?? []).map((item) => (
            <div key={item.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/produtos/${item.product_slug}`} className="font-medium text-verde-escuro hover:text-verde-musgo">
                  {item.product_name}
                </Link>
                <p className="text-sm text-verde-escuro/60">
                  {item.quantity}x {formatPrice(Number(item.unit_price))}
                </p>
              </div>
              <OrderItemSupplier
                orderId={order.id}
                itemId={item.id}
                initialSupplierName={item.supplier_name}
                initialSupplierCost={item.supplier_cost != null ? Number(item.supplier_cost) : null}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-verde-claro/20 pt-4 text-sm">
          <span className="text-verde-escuro/70">Subtotal + frete</span>
          <span className="font-semibold text-verde-escuro">
            {formatPrice(Number(order.subtotal))} + {formatPrice(Number(order.shipping_price))} de frete
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-base">
          <span className="font-semibold text-verde-escuro">Total pago</span>
          <span className="font-semibold text-verde-escuro">{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {uniqueSuppliers.length > 0 && (
        <div className="mt-6 rounded-2xl border border-dourado/40 bg-dourado/5 p-5">
          <p className="text-sm font-semibold text-verde-escuro">Onde comprar (referência, não é integração automática)</p>
          <ul className="mt-3 space-y-2">
            {uniqueSuppliers.map((s) => (
              <li key={s.name} className="text-sm">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-semibold text-verde-musgo hover:text-verde-escuro"
                >
                  {s.name} <ExternalLink size={12} />
                </a>
                <p className="text-verde-escuro/60">{s.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
