"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";

/**
 * Os stores de carrinho/favoritos usam skipHydration: lendo o localStorage só
 * depois do mount evita divergir do HTML renderizado no servidor (que nunca
 * tem acesso ao localStorage do usuário).
 */
export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useFavoritesStore.persist.rehydrate();
  }, []);

  return null;
}
