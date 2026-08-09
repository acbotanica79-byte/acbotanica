import type { Metadata } from "next";
import CalendarioRegaClient from "@/components/calculators/CalendarioRegaClient";

export const metadata: Metadata = {
  title: "Calendário de Rega",
  description: "Lembretes de rega personalizados para cada espécie.",
};

export default function CalendarioRegaPage() {
  return <CalendarioRegaClient />;
}
