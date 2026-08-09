import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, Droplets, Wrench, Sprout, Bug, Home as HomeIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Guias",
  description: "Guias práticos e passo a passo para cuidar, cultivar e decorar com plantas.",
};

const guides = [
  { title: "Como montar terrário", icon: Layers, href: "/blog/montando-terrario-fechado" },
  { title: "Como cuidar de suculentas", icon: Sprout, href: "/blog/como-cuidar-de-suculentas" },
  { title: "Como regar corretamente", icon: Droplets, href: "/cuidados" },
  { title: "Como trocar de vaso", icon: Wrench, href: "/cuidados" },
  { title: "Como podar plantas", icon: Wrench, href: "/cuidados" },
  { title: "Como fazer mudas", icon: Sprout, href: "/cuidados" },
  { title: "Como adubar corretamente", icon: Sprout, href: "/cuidados" },
  { title: "Como controlar fungos", icon: Bug, href: "/cuidados" },
  { title: "Como evitar pragas", icon: Bug, href: "/cuidados" },
  { title: "Como cultivar em apartamento", icon: HomeIcon, href: "/blog/plantas-para-apartamentos-pequenos" },
];

export default function GuiasPage() {
  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Aprenda com a gente
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Guias
        </h1>
        <p className="mt-2 max-w-2xl text-verde-escuro/70">
          Passo a passo para cada etapa do cuidado com suas plantas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map(({ title, icon: Icon, href }) => (
          <Link
            key={title}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-verde-claro/25 bg-branco/90 p-5 transition-colors hover:border-verde-musgo"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-verde-claro/20 text-verde-musgo">
              <Icon size={19} />
            </span>
            <span className="flex-1 font-medium text-verde-escuro">{title}</span>
            <ArrowRight size={16} className="text-verde-escuro/40 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
