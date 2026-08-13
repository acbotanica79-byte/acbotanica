import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Heart, ShieldCheck, Truck } from "lucide-react";
import { SITE_OWNER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description: "Conheça a ACCFG Botânica: curadoria de plantas, vasos e artigos de jardinagem premium.",
};

const values = [
  {
    icon: Leaf,
    title: "Curadoria de verdade",
    text: "Cada planta e cada peça do catálogo é escolhida a dedo, pensando em qualidade e durabilidade.",
  },
  {
    icon: Heart,
    title: "Cuidado em cada detalhe",
    text: "Da embalagem ao atendimento, tratamos cada pedido como se fosse pra nossa própria casa.",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    text: "Pagamento processado pelo Mercado Pago, com PIX, cartão e boleto.",
  },
  {
    icon: Truck,
    title: "Entrega para todo o Brasil",
    text: "Calculamos o frete real pra cada CEP, com prazos claros antes de você fechar a compra.",
  },
];

export default function SobrePage() {
  return (
    <div className="container-px mx-auto max-w-[900px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Quem somos
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Sobre a ACCFG Botânica
        </h1>
      </div>

      <div className="space-y-4 text-verde-escuro/80 leading-relaxed">
        <p>
          A ACCFG Botânica nasceu da paixão de {SITE_OWNER} por plantas, jardinagem e por criar
          ambientes mais verdes, sofisticados e acolhedores. O que começou como um cuidado pessoal
          com espécies e vasos virou uma curadoria completa: plantas, suculentas, cactos, vasos
          artesanais e acessórios para transformar qualquer cantinho da casa.
        </p>
        <p>
          Acreditamos que cuidar de plantas é também um jeito de cuidar da gente — por isso
          selecionamos cada item pensando em quem vai receber em casa, com atenção à qualidade,
          à origem e ao cuidado que cada espécie precisa pra florescer de verdade.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-verde-claro/25 bg-branco/90 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro/20 text-verde-musgo">
              <Icon size={19} />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-verde-escuro">{title}</h2>
            <p className="mt-1.5 text-sm text-verde-escuro/70">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-verde-claro/30 bg-verde-escuro/[0.03] p-6 text-center">
        <p className="text-verde-escuro/80">
          Tem alguma dúvida ou quer conversar com a gente?
        </p>
        <Link
          href="/contato"
          className="mt-3 inline-flex rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo"
        >
          Fale conosco
        </Link>
      </div>
    </div>
  );
}
