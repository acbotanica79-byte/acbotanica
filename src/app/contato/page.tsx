import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import ContatoForm from "@/components/ContatoForm";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a equipe AC Botânica.",
};

export default function ContatoPage() {
  return (
    <div className="container-px mx-auto max-w-[1100px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Estamos por aqui
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Fale com a gente
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <ContatoForm />

        <div className="h-fit space-y-4 rounded-3xl border border-verde-claro/30 bg-verde-escuro p-8 text-branco">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-verde-claro shrink-0" />
            <span className="text-sm text-areia/85">São Paulo, SP — Brasil</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-verde-claro shrink-0" />
            <span className="text-sm text-areia/85">(11) 99999-9999</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-verde-claro shrink-0" />
            <span className="text-sm text-areia/85">contato@acbotanica.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
}
