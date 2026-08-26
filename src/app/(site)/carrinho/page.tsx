import type { Metadata } from "next";
import CarrinhoClient from "@/components/cart/CarrinhoClient";
import { getSiteTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os itens do seu carrinho na ACCFG Botânica.",
  robots: { index: false, follow: true },
};

export default async function CarrinhoPage() {
  const theme = await getSiteTheme();
  return <CarrinhoClient freeShippingThreshold={theme.freeShippingThreshold} />;
}
