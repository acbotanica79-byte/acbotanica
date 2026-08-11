import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Explore todas as categorias da ACCFG Botânica: plantas, suculentas, cactos, vasos, ferramentas e muito mais.",
};

export default function CategoriasPage() {
  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Navegue pelo catálogo
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Todas as categorias
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categorias/${cat.slug}`}
            className="group relative flex aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-verde-escuro/85 via-verde-escuro/10 to-transparent" />
            <div className="relative z-10 mt-auto p-4">
              <span className="font-display text-lg font-semibold text-branco">{cat.name}</span>
              <p className="mt-1 text-xs text-areia/80 line-clamp-2">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
