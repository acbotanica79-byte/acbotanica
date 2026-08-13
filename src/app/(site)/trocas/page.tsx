import type { Metadata } from "next";
import { ShieldCheck, PackageCheck, Mail } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Trocas e Devoluções",
  description: "Política de trocas e devoluções da ACCFG Botânica.",
};

const steps = [
  {
    icon: ShieldCheck,
    title: "Prazo de 7 dias",
    text: "Você tem até 7 dias corridos a partir do recebimento do pedido para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.",
  },
  {
    icon: Mail,
    title: "Entre em contato",
    text: `Escreva pra gente em ${CONTACT_EMAIL} ou pela página de Contato, com o número do pedido e o motivo da troca/devolução.`,
  },
  {
    icon: PackageCheck,
    title: "Envio e reembolso",
    text: "Combinamos com você a melhor forma de devolver o item. Após recebermos e conferirmos o produto, o reembolso ou a troca é processado em até 7 dias úteis.",
  },
];

export default function TrocasPage() {
  return (
    <div className="container-px mx-auto max-w-[800px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Sua compra é garantida
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Trocas e Devoluções
        </h1>
      </div>

      <div className="space-y-5">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-verde-claro/25 bg-branco/90 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-verde-claro/20 text-verde-musgo">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
                Passo {i + 1}
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-verde-escuro">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-verde-escuro/70">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-verde-claro/30 bg-verde-escuro/[0.03] p-6 text-sm leading-relaxed text-verde-escuro/70">
        <p>
          <strong className="text-verde-escuro">Plantas e itens naturais:</strong> como são produtos
          vivos, avalie a planta assim que ela chegar e nos avise em até 24 horas caso identifique
          algum problema no transporte, pra agilizarmos a solução.
        </p>
        <p className="mt-3">
          <strong className="text-verde-escuro">Produtos com defeito de fabricação</strong> têm
          troca garantida independente do prazo padrão, mediante análise do item.
        </p>
      </div>
    </div>
  );
}
