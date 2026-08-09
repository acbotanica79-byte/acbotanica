import Link from "next/link";
import { Camera, Calculator, Droplets, MapPin, ArrowRight } from "lucide-react";

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

export default function ToolsTeaser() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 bg-verde-escuro" />
      <div className="relative z-10 container-px mx-auto max-w-[1600px]">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-verde-claro">
            Tecnologia a serviço da natureza
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-branco sm:text-4xl">
            Ferramentas exclusivas ACCFG Botânica
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ icon: Icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-4 rounded-2xl border border-areia/15 bg-branco/5 p-6 backdrop-blur-sm transition-colors hover:bg-branco/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro text-verde-escuro">
                <Icon size={19} />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-branco">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-areia/70">{desc}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-verde-claro">
                Experimentar
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
