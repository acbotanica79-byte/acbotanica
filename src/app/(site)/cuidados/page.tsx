import type { Metadata } from "next";
import { Sun, Droplets, Sprout, Bug, Scissors, Thermometer } from "lucide-react";

export const metadata: Metadata = {
  title: "Cuidados",
  description: "Dicas rápidas de cuidado essencial para manter suas plantas saudáveis.",
};

const tips = [
  {
    icon: Sun,
    title: "Luz",
    text: "Observe a luminosidade real do ambiente antes de escolher a planta. Luz indireta forte é ideal para a maioria das espécies de interior.",
  },
  {
    icon: Droplets,
    title: "Rega",
    text: "Regue apenas quando o substrato estiver seco ao toque. Excesso de água é a causa mais comum de morte de plantas.",
  },
  {
    icon: Sprout,
    title: "Substrato",
    text: "Use substrato específico para cada tipo de planta — suculentas precisam de drenagem rápida, folhagens de retenção moderada.",
  },
  {
    icon: Bug,
    title: "Pragas",
    text: "Inspecione as folhas regularmente. Cochonilhas e ácaros são detectados cedo com observação semanal.",
  },
  {
    icon: Scissors,
    title: "Poda",
    text: "Remova folhas secas ou amareladas para direcionar energia ao crescimento saudável da planta.",
  },
  {
    icon: Thermometer,
    title: "Temperatura",
    text: "A maioria das plantas tropicais prospera entre 18°C e 27°C, longe de correntes de ar frio ou aparelhos de ar-condicionado.",
  },
];

export default function CuidadosPage() {
  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Dicas rápidas
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Cuidados essenciais
        </h1>
        <p className="mt-2 max-w-2xl text-verde-escuro/70">
          Os fundamentos para manter qualquer planta saudável, independente da espécie.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-verde-claro/25 bg-branco/90 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
              <Icon size={19} />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-verde-escuro">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-verde-escuro/70">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
