import type { Metadata } from "next";
import CarrinhoClient from "@/components/cart/CarrinhoClient";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os itens do seu carrinho na AC Botânica.",
  robots: { index: false, follow: true },
};

export default function CarrinhoPage() {
  return <CarrinhoClient />;
}
