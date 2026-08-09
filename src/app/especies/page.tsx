import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { species } from "@/lib/data/species";

export const metadata: Metadata = {
  title: "Espécies",
  description: "Catálogo botânico completo com fichas técnicas de cuidado para cada espécie.",
};

export default function EspeciesPage() {
  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Catálogo botânico
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Espécies
        </h1>
        <p className="mt-2 max-w-2xl text-verde-escuro/70">
          Fichas técnicas completas com luz, água, solo e curiosidades de cada espécie.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {species.map((sp) => (
          <Link
            key={sp.slug}
            href={`/especies/${sp.slug}`}
            className="group flex overflow-hidden rounded-2xl border border-verde-claro/25 bg-branco/90"
          >
            <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-areia">
              <Image
                src={sp.images[0]}
                alt={sp.popularName}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center p-4">
              <h2 className="font-display text-lg font-semibold text-verde-escuro">
                {sp.popularName}
              </h2>
              <p className="text-xs italic text-verde-escuro/50">{sp.scientificName}</p>
              <p className="mt-1 text-xs text-verde-escuro/60">{sp.family}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
