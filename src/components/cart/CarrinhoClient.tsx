"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useCartStore, cartTotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import FreteCalculator, { type FreteResponse } from "@/components/product/FreteCalculator";

export default function CarrinhoClient() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount guard for persisted store
  useEffect(() => setMounted(true), []);

  const total = mounted ? cartTotal(items) : 0;
  const list = mounted ? items : [];

  const [frete, setFrete] = useState<FreteResponse | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ number: "", complement: "" });
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  function handleFreteResult(result: FreteResponse | null) {
    setFrete(result);
    if (result) setShowAddressForm(true);
  }

  const shippingPrice = frete ? (total >= FREE_SHIPPING_THRESHOLD ? 0 : frete.price) : 0;
  const grandTotal = total + shippingPrice;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!frete) return;
    setCheckoutError(null);
    setSubmitting(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: list.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity,
        })),
        customer,
        shipping: {
          cep: frete.cep,
          address: frete.logradouro,
          number: address.number,
          complement: address.complement,
          neighborhood: frete.bairro,
          city: frete.localidade,
          uf: frete.uf,
        },
        shippingPrice,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setCheckoutError(data.error ?? "Não foi possível finalizar o pedido.");
      return;
    }

    clear();
    window.location.href = data.checkoutUrl;
  }

  return (
    <div className="container-px mx-auto max-w-[1200px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Seu pedido
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Carrinho
        </h1>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-verde-claro/50 py-24 text-center text-verde-escuro/60">
          <ShoppingBag size={36} strokeWidth={1.5} />
          <p>Seu carrinho está vazio.</p>
          <Link
            href="/produtos"
            className="mt-2 rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-medium text-areia hover:bg-verde-musgo"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col divide-y divide-verde-claro/20">
            {list.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 py-5">
                <Link
                  href={`/produtos/${product.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-areia"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="font-display text-lg font-semibold text-verde-escuro hover:text-verde-musgo"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-verde-escuro/60">
                      {formatPrice(product.price)} / unidade
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-verde-claro/50">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-2 text-verde-escuro hover:text-verde-musgo"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-2 text-verde-escuro hover:text-verde-musgo"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="flex items-center gap-1 text-sm text-verde-escuro/50 hover:text-terracota"
                    >
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                </div>
                <span className="font-display text-lg font-semibold text-verde-escuro">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-verde-claro/30 bg-branco/80 p-6">
            <h2 className="font-display text-lg font-semibold text-verde-escuro">Resumo</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-verde-escuro/70">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-verde-escuro/70">
              <span>Frete</span>
              <span>
                {!frete
                  ? total >= FREE_SHIPPING_THRESHOLD
                    ? "Grátis"
                    : `Calcule abaixo · faltam ${formatPrice(FREE_SHIPPING_THRESHOLD - total)} p/ grátis`
                  : shippingPrice === 0
                  ? "Grátis"
                  : formatPrice(shippingPrice)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-verde-claro/25 pt-4 text-base font-semibold text-verde-escuro">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>

            <div className="mt-5 border-t border-verde-claro/25 pt-5">
              <p className="mb-3 text-sm font-semibold text-verde-escuro">Calcule o frete</p>
              <FreteCalculator subtotal={total} onResult={handleFreteResult} />
            </div>

            {showAddressForm && frete && (
              <form onSubmit={handleCheckout} className="mt-5 space-y-3 border-t border-verde-claro/25 pt-5">
                <p className="text-sm font-semibold text-verde-escuro">Dados para entrega</p>
                <input
                  required
                  placeholder="Nome completo"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  autoComplete="name"
                  className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                />
                <input
                  required
                  type="email"
                  placeholder="E-mail"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  autoComplete="email"
                  inputMode="email"
                  className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                />
                <input
                  placeholder="Telefone / WhatsApp"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  inputMode="tel"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                />
                <p className="text-xs text-verde-escuro/60">
                  {frete.logradouro}, {frete.bairro} — {frete.localidade}/{frete.uf}
                </p>
                <div className="flex gap-3">
                  <input
                    required
                    placeholder="Número"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    className="w-1/2 rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                  />
                  <input
                    placeholder="Complemento"
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    className="w-1/2 rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                  />
                </div>

                {checkoutError && <p className="text-sm text-terracota">{checkoutError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia hover:bg-verde-musgo transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="mx-auto animate-spin" />
                  ) : (
                    `Pagar ${formatPrice(grandTotal)}`
                  )}
                </button>
              </form>
            )}

            {!showAddressForm && (
              <p className="mt-6 text-center text-xs text-verde-escuro/50">
                Calcule o frete acima para continuar para o pagamento.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
