import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/data/categories";

const homeCategories = [
  { slug: "suculentas", label: "Suculentas" },
  { slug: "cactos", label: "Cactos" },
  { slug: "vasos", label: "Vasos" },
  { slug: "presentes-kits", label: "Kits" },
  { slug: "ferramentas", label: "Jardinagem" },
  { slug: "decoracao", label: "Decoração" },
] as const;

export default function CategoryShowcase() {
  return (
    <section className="container-px mx-auto max-w-[1600px] py-16 sm:py-24">
      <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
            Categorias
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
            Nossas Categorias
          </h2>
        </div>
        <Link
          href="/categorias"
          className="text-sm font-semibold text-verde-musgo underline decoration-verde-claro decoration-2 underline-offset-4 hover:text-verde-escuro"
        >
          Ver todas as categorias
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {homeCategories.map(({ slug, label }) => {
          const cat = getCategoryBySlug(slug);
          if (!cat) return null;
          return (
            <Link
              key={slug}
              href={`/categorias/${slug}`}
              className="group relative flex aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={cat.image}
                alt={label}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-verde-escuro/85 via-verde-escuro/10 to-transparent" />
              <span className="relative z-10 mt-auto p-4 font-display text-lg font-semibold text-branco">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
