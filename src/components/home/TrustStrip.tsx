import { Truck, Sprout, ShieldCheck, Headset } from "lucide-react";

const items = [
  { icon: Truck, title: "Entrega para todo o Brasil", desc: "Enviamos com amor" },
  { icon: Sprout, title: "Plantas selecionadas", desc: "Qualidade garantida" },
  { icon: ShieldCheck, title: "Pagamento seguro", desc: "PIX, Cartão e Boleto" },
  { icon: Headset, title: "Atendimento especial", desc: "Suporte humanizado" },
];

export default function TrustStrip() {
  return (
    <section className="container-px mx-auto max-w-[1600px] py-4">
      <div className="grid grid-cols-2 gap-4 rounded-3xl bg-verde-escuro/[0.04] p-6 sm:grid-cols-4 sm:p-8">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-verde-escuro leading-tight">{title}</p>
              <p className="text-xs text-verde-escuro/60 leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
