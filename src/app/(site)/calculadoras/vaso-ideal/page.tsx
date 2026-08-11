import type { Metadata } from "next";
import VasoIdealCalculator from "@/components/calculators/VasoIdealCalculator";

export const metadata: Metadata = {
  title: "Calculadora de Vaso Ideal",
  description: "Descubra o tamanho perfeito de vaso para cada planta.",
};

export default function VasoIdealPage() {
  return (
    <div className="container-px mx-auto max-w-[900px] py-12 sm:py-16">
      <VasoIdealCalculator />
    </div>
  );
}
