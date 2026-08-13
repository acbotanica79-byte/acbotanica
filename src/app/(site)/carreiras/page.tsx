import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Trabalhe Conosco",
  description: "Quer fazer parte da ACCFG Botânica? Envie seu contato.",
};

export default function CarreirasPage() {
  return (
    <div className="container-px mx-auto max-w-[700px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Faça parte
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Trabalhe Conosco
        </h1>
      </div>

      <div className="rounded-2xl border border-verde-claro/25 bg-branco/90 p-8 text-center">
        <p className="text-verde-escuro/80 leading-relaxed">
          No momento não temos vagas abertas, mas estamos sempre de olho em gente apaixonada por
          plantas e por um bom atendimento. Se você quer fazer parte do time da ACCFG Botânica, manda
          um e-mail contando um pouco sobre você — a gente guarda seu contato para as próximas
          oportunidades.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Trabalhe Conosco`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo"
        >
          <Mail size={16} />
          {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  );
}
