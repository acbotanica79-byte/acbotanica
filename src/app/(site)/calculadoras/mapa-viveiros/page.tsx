import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import ViveirosMapClient from "@/components/maps/ViveirosMapClient";

export const metadata: Metadata = {
  title: "Mapa de Viveiros",
  description: "Encontre viveiros parceiros ACCFG Botânica perto de você.",
};

export default function MapaViveirosPage() {
  return (
    <div className="container-px mx-auto max-w-[900px] py-12 sm:py-16">
      <div className="rounded-3xl border border-verde-claro/30 bg-branco/90 p-8 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
          <MapPin size={20} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
          Mapa de Viveiros
        </h1>
        <p className="mt-2 max-w-xl text-verde-escuro/70">
          Viveiros parceiros ACCFG Botânica pelo Brasil. Use sua localização para ver
          a distância até cada um.
        </p>

        <div className="mt-8">
          <ViveirosMapClient />
        </div>
      </div>
    </div>
  );
}
