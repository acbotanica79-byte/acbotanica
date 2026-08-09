"use client";

import { useEffect, useRef } from "react";
import { CreditCard, Percent, Truck, RefreshCcw, Sprout, ShieldCheck, Leaf, Headset } from "lucide-react";

const rows = [
  [
    { icon: CreditCard, title: "Parcele em até 6x", desc: "Sem juros no cartão" },
    { icon: Percent, title: "5% de desconto no PIX", desc: "Pagamento à vista" },
    { icon: Truck, title: "Frete rápido e seguro", desc: "Para todo o Brasil" },
    { icon: RefreshCcw, title: "Troca fácil", desc: "7 dias para trocar" },
  ],
  [
    { icon: Sprout, title: "Cuidados Especiais", desc: "Dicas para suas plantas" },
    { icon: ShieldCheck, title: "Garantia ACCFG Botânica", desc: "Qualidade em cada detalhe" },
    { icon: Leaf, title: "Sustentabilidade", desc: "Compromisso com o planeta" },
    { icon: Headset, title: "Atendimento Humanizado", desc: "Estamos aqui para ajudar" },
  ],
];

const ICON_COLORS = [
  "bg-verde-musgo/10 text-verde-musgo",
  "bg-dourado/15 text-dourado",
  "bg-terracota/10 text-terracota",
  "bg-verde-claro/30 text-verde-escuro",
];

export default function BenefitsGrid() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const items = ref.current?.querySelectorAll<HTMLElement>(".reveal");
    if (!items) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="container-px mx-auto max-w-[1600px] pb-16 sm:pb-24">
      <div className="divide-y divide-verde-escuro/10 border-t border-verde-escuro/10">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-2 gap-y-6 py-6 sm:grid-cols-4">
            {row.map(({ icon: Icon, title, desc }, ci) => {
              const colorClass = ICON_COLORS[(ri * 4 + ci) % ICON_COLORS.length];
              const delay = `${(ri * 4 + ci) * 80}ms`;
              return (
                <div
                  key={title}
                  className="reveal flex items-center gap-3 px-2"
                  style={{ transitionDelay: delay }}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 ${colorClass}`}
                  >
                    <Icon size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-verde-escuro leading-tight">{title}</p>
                    <p className="text-xs text-verde-escuro/55 leading-tight mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
