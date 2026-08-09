"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore, cartTotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = cartTotal(items);
  const pathname = usePathname();

  // A página /carrinho já mostra o conteúdo do carrinho — evita o drawer sobrepor a página inteira.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fecha o drawer ao navegar para a página de carrinho
  useEffect(() => {
    if (pathname === "/carrinho") closeCart();
  }, [pathname, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-verde-escuro/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-branco shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-verde-claro/30">
              <span className="font-display text-xl font-semibold text-verde-escuro flex items-center gap-2">
                <ShoppingBag size={20} /> Seu Carrinho
              </span>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-verde-claro/20"
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-verde-escuro/60 p-8 text-center">
                <ShoppingBag size={40} strokeWidth={1.5} />
                <p>Seu carrinho está vazio.</p>
                <Link
                  href="/produtos"
                  onClick={closeCart}
                  className="mt-2 rounded-full bg-verde-escuro px-5 py-2.5 text-sm font-medium text-areia hover:bg-verde-musgo transition-colors"
                >
                  Explorar produtos
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-areia">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-verde-escuro line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-sm text-terracota font-semibold mt-1">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full border border-verde-claro/60 hover:bg-verde-claro/20"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full border border-verde-claro/60 hover:bg-verde-claro/20"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="ml-auto text-verde-escuro/40 hover:text-terracota"
                            aria-label="Remover"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-verde-claro/30 space-y-3">
                  <div className="flex items-center justify-between text-base font-semibold text-verde-escuro">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <Link
                    href="/carrinho"
                    onClick={closeCart}
                    className="flex w-full items-center justify-center rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia hover:bg-verde-musgo transition-colors"
                  >
                    Finalizar Pedido
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
