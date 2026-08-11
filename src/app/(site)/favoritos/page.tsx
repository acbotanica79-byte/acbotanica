import type { Metadata } from "next";
import FavoritosClient from "@/components/favorites/FavoritosClient";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Seus produtos favoritos na ACCFG Botânica.",
  robots: { index: false, follow: true },
};

export default function FavoritosPage() {
  return <FavoritosClient />;
}
