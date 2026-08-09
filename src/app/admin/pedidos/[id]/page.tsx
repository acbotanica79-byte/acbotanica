import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MapPin, User, Package, Wallet, Truck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSuppliersForCategory } from "@/lib/data/suppliers";
import { DISTANCE_BANDS, estimateSupplierFreight } from "@/lib/frete";
import { formatPrice } from "@/lib/utils";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import OrderItemSupplier from "@/components/admin/OrderItemSupplier";

// Taxa aproximada do Mercado Pago Checkout Pro — varia por forma de pagamento
// (cartão costuma ficar perto de 5%, PIX perto de 1%). Sem saber qual o
// cliente escolheu, usamos a taxa do cartão como estimativa conservadora
// (pior caso), deixando claro que é aproximado.
const MP_FEE_ESTIMATE_PCT = 0.05;

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

  const itemsList = items ?? [];
  const pendingCostCount = itemsList.filter((i) => i.supplier_cost == null).length;
  const totalSupplierCost = itemsList.reduce(
    (sum, i) => sum + (i.supplier_cost != null ? Number(i.supplier_cost) * i.quantity : 0),
    0
  );

  const freightEstimates = await Promise.all(
    itemsList.map((item) =>
      estimateSupplierFreight({
        supplierCep: item.supplier_cep,
        supplierUf: item.supplier_uf,
        international: item.supplier_international,
        destCep: order.shipping_cep,
        destUf: order.shipping_uf,
      })
    )
  );
  const itemsWithFreight = itemsList.map((item, i) => ({ item, freight: freightEstimates[i] }));
  const totalRealFreight = itemsWithFreight.reduce((sum, { freight }) => sum + (freight?.price ?? 0), 0);
  const pendingFreightCount = itemsWithFreight.filter(({ freight }) => !freight).length;

  const shippingCharged = Number(order.shipping_price);
  const mpFeeEstimate = Number(order.total) * MP_FEE_ESTIMATE_PCT;
  const estimatedProfit =
    Number(order.subtotal) + shippingCharged - totalSupplierCost - totalRealFreight - mpFeeEstimate;

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
          {itemsWithFreight.map(({ item, freight }) => (
            <div key={item.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/produtos/${item.product_slug}`} className="font-medium text-verde-escuro hover:text-verde-musgo">
                  {item.product_name}
                </Link>
                <p className="text-sm text-verde-escuro/60">
                  {item.quantity}x {formatPrice(Number(item.unit_price))}
                </p>
                {freight && (
                  <p className="text-xs text-verde-escuro/50">
                    Frete real estimado: {formatPrice(freight.price)} · {freight.label}
                  </p>
                )}
              </div>
              <OrderItemSupplier
                orderId={order.id}
                itemId={item.id}
                initialSupplierName={item.supplier_name}
                initialSupplierCost={item.supplier_cost != null ? Number(item.supplier_cost) : null}
                initialSupplierUf={item.supplier_uf}
                initialSupplierCep={item.supplier_cep}
                initialSupplierInternational={item.supplier_international ?? false}
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
          <span className="font-semibold text-verde-escuro">Total pago pelo cliente</span>
          <span className="font-semibold text-verde-escuro">{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-verde-musgo/30 bg-verde-musgo/5 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-verde-escuro">
          <Wallet size={15} /> Seu lucro estimado neste pedido
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-verde-escuro/70">Valor dos produtos (sem frete)</span>
            <span className="text-verde-escuro">{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-verde-escuro/70">(+) Frete cobrado do cliente</span>
            <span className="text-verde-escuro">+{formatPrice(shippingCharged)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-verde-escuro/70">
              (–) Custo pago ao fornecedor
              {pendingCostCount > 0 && (
                <span className="ml-1 text-terracota">
                  ({pendingCostCount} {pendingCostCount === 1 ? "item sem custo lançado" : "itens sem custo lançado"})
                </span>
              )}
            </span>
            <span className="text-verde-escuro">−{formatPrice(totalSupplierCost)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-verde-escuro/70">
              (–) Frete real estimado (fornecedor → cliente)
              {pendingFreightCount > 0 && (
                <span className="ml-1 text-terracota">
                  ({pendingFreightCount} {pendingFreightCount === 1 ? "item sem origem lançada" : "itens sem origem lançada"})
                </span>
              )}
            </span>
            <span className="text-verde-escuro">−{formatPrice(totalRealFreight)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-verde-escuro/70">(–) Taxa Mercado Pago (estimativa ~5%, varia por forma de pagamento)</span>
            <span className="text-verde-escuro">−{formatPrice(mpFeeEstimate)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-verde-musgo/25 pt-2 text-base font-semibold">
            <span className="text-verde-escuro">Sua comissão (lucro) estimada</span>
            <span className={estimatedProfit >= 0 ? "text-verde-musgo" : "text-terracota"}>
              {formatPrice(estimatedProfit)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-verde-escuro/50">
          Preencha a UF (ou o CEP, mais preciso) do fornecedor em cada item acima pra essa conta ficar exata — sem
          isso, o frete real desse item entra como R$0 (subestimando o custo).
          {pendingCostCount > 0 && " Preencha também o custo de cada item."}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-verde-claro/30 bg-branco p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-verde-escuro">
          <Truck size={15} /> Diretrizes de frete (calculado por distância do CD)
        </p>
        <p className="mt-1 text-xs text-verde-escuro/50">
          O frete é calculado automaticamente no checkout pela distância real até o CEP do cliente — o endereço do
          depósito não é exibido em nenhum lugar do site. Faixas de referência:
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-verde-escuro/50">
                <th className="py-1 pr-3">Região</th>
                <th className="py-1 pr-3">Distância</th>
                <th className="py-1 pr-3">Frete cobrado</th>
                <th className="py-1">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {DISTANCE_BANDS.map((band, i) => {
                const prevMax = i > 0 ? DISTANCE_BANDS[i - 1].maxKm : 0;
                const isThisOrder = Number(order.shipping_price) === band.price;
                return (
                  <tr
                    key={band.label}
                    className={`border-t border-verde-claro/10 ${isThisOrder ? "bg-verde-musgo/10 font-semibold text-verde-escuro" : "text-verde-escuro/70"}`}
                  >
                    <td className="py-1.5 pr-3">{band.label}</td>
                    <td className="py-1.5 pr-3">
                      {prevMax > 0 ? `${prevMax}–` : "até "}
                      {band.maxKm === Infinity ? "+ km" : `${band.maxKm} km`}
                    </td>
                    <td className="py-1.5 pr-3">{formatPrice(band.price)}</td>
                    <td className="py-1.5">
                      {band.minDays}–{band.maxDays} dias úteis
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-verde-escuro/50">
          Frete grátis acima de R$199. Este pedido cobrou {formatPrice(Number(order.shipping_price))} de frete
          {DISTANCE_BANDS.some((b) => Number(order.shipping_price) === b.price) ? " (faixa destacada acima)" : ""}.
        </p>
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
