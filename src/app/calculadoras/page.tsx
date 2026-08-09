import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Calculator, Droplets, MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Calculadoras",
  description: "Ferramentas exclusivas AC Botânica: identificador de plantas, calculadora de vaso, calendário de rega e mapa de viveiros.",
};

const tools = [
  {
    icon: Camera,
    title: "Identificador de Plantas",
    desc: "Envie uma foto e descubra a espécie instantaneamente.",
    href: "/calculadoras/identificador",
  },
  {
    icon: Calculator,
    title: "Calculadora de Vaso Ideal",
    desc: "Descubra o tamanho perfeito de vaso para cada planta.",
    href: "/calculadoras/vaso-ideal",
  },
  {
    icon: Droplets,
    title: "Calendário de Rega",
    desc: "Lembretes personalizados para cada espécie.",
    href: "/calculadoras/calendario-rega",
  },
  {
    icon: MapPin,
    title: "Mapa de Viveiros",
    desc: "Encontre viveiros parceiros perto de você.",
    href: "/calculadoras/mapa-viveiros",
  },
];

export default function CalculadorasPage() {
  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Tecnologia a serviço da natureza
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Calculadoras e ferramentas
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {tools.map(({ icon: Icon, title, desc, href }) => (
          <Link
            key={title}
            href={href}
            className="group flex flex-col gap-4 rounded-2xl border border-verde-claro/25 bg-branco/90 p-7 transition-colors hover:border-verde-musgo"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
              <Icon size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-verde-escuro">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-verde-escuro/65">{desc}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-verde-musgo">
              Experimentar
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
