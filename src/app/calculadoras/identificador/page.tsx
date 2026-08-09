import type { Metadata } from "next";
import IdentificadorClient from "@/components/calculators/IdentificadorClient";

export const metadata: Metadata = {
  title: "Identificador de Plantas",
  description: "Envie uma foto e descubra a espécie da sua planta instantaneamente.",
};

export default function IdentificadorPage() {
  return <IdentificadorClient />;
}
