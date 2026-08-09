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

export default function BenefitsGrid() {
  return (
    <section className="container-px mx-auto max-w-[1600px] pb-16 sm:pb-24">
      <div className="divide-y divide-verde-escuro/10 border-t border-verde-escuro/10">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 gap-y-6 py-6 sm:grid-cols-4">
            {row.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-2">
                <Icon size={20} className="shrink-0 text-verde-musgo" />
                <div>
                  <p className="text-sm font-semibold text-verde-escuro leading-tight">{title}</p>
                  <p className="text-xs text-verde-escuro/55 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
