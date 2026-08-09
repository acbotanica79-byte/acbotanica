"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, cartTotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import FreteCalculator from "@/components/product/FreteCalculator";

export default function CarrinhoClient() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount guard for persisted store
  useEffect(() => setMounted(true), []);

  const total = mounted ? cartTotal(items) : 0;
  const list = mounted ? items : [];

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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
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
                {total >= FREE_SHIPPING_THRESHOLD
                  ? "Grátis"
                  : `Calcule abaixo · faltam ${formatPrice(FREE_SHIPPING_THRESHOLD - total)} p/ grátis`}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-verde-claro/25 pt-4 text-base font-semibold text-verde-escuro">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="mt-5 border-t border-verde-claro/25 pt-5">
              <p className="mb-3 text-sm font-semibold text-verde-escuro">Calcule o frete</p>
              <FreteCalculator subtotal={total} />
            </div>

            <button className="mt-6 w-full rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia hover:bg-verde-musgo transition-colors">
              Finalizar Pedido
            </button>
            <p className="mt-3 text-center text-xs text-verde-escuro/50">
              Catálogo sem controle de estoque — finalização de compra em breve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
