import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Sun, Droplets, Thermometer, Sprout, Flower2, AlertTriangle, BadgeCheck, ExternalLink } from "lucide-react";
import { species, getSpeciesBySlug } from "@/lib/data/species";
import { matchSpecies, getSpeciesImages, getOccurrenceCount } from "@/lib/gbif";

export function generateStaticParams() {
  return species.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = getSpeciesBySlug(slug);
  if (!sp) return {};
  return {
    title: `${sp.popularName} (${sp.scientificName})`,
    description: `Ficha completa de cuidados: ${sp.popularName}, luz, água, solo e curiosidades.`,
  };
}

export default async function SpeciesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sp = getSpeciesBySlug(slug);
  if (!sp) notFound();

  const similar = sp.similarSlugs
    .map((s) => getSpeciesBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const gbifMatch = await matchSpecies(sp.scientificName);
  const [gbifImages, gbifCount] = gbifMatch
    ? await Promise.all([getSpeciesImages(gbifMatch.usageKey), getOccurrenceCount(gbifMatch.usageKey)])
    : [[], 0];

  const facts = [
    { icon: Sun, label: "Luz", value: sp.light },
    { icon: Droplets, label: "Água", value: sp.water },
    { icon: Thermometer, label: "Temperatura", value: sp.temperature },
    { icon: Sprout, label: "Solo", value: sp.soil },
    { icon: Flower2, label: "Floração", value: sp.bloom },
    { icon: AlertTriangle, label: "Toxicidade", value: sp.toxicity },
  ];

  return (
    <div className="container-px mx-auto max-w-[1200px] py-10 sm:py-14">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-verde-escuro/55">
        <Link href="/" className="hover:text-verde-musgo">Home</Link>
        <ChevronRight size={13} />
        <Link href="/especies" className="hover:text-verde-musgo">Espécies</Link>
        <ChevronRight size={13} />
        <span className="text-verde-escuro">{sp.popularName}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-areia">
          <Image src={sp.images[0]} alt={sp.popularName} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
            {sp.popularName}
          </h1>
          <p className="mt-1 text-base italic text-verde-escuro/55">{sp.scientificName}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-verde-claro/20 px-3 py-1 font-medium text-verde-musgo">
              Família: {sp.family}
            </span>
            <span className="rounded-full bg-verde-claro/20 px-3 py-1 font-medium text-verde-musgo">
              Origem: {sp.origin}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3 rounded-xl bg-verde-escuro/[0.04] p-4">
                <Icon size={18} className="mt-0.5 shrink-0 text-verde-musgo" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-verde-escuro/50">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm text-verde-escuro">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-verde-escuro">Adubação</h2>
            <p className="mt-1.5 text-sm text-verde-escuro/75">{sp.fertilizing}</p>
          </div>
          <div className="mt-5">
            <h2 className="font-display text-lg font-semibold text-verde-escuro">Propagação</h2>
            <p className="mt-1.5 text-sm text-verde-escuro/75">{sp.propagation}</p>
          </div>
        </div>
      </div>

      {gbifMatch && (
        <div className="mt-14 rounded-2xl border border-verde-claro/30 bg-branco/90 p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-display text-xl font-semibold text-verde-escuro">
              <BadgeCheck size={20} className="text-verde-musgo" />
              Dados científicos verificados
            </p>
            <a
              href={`https://www.gbif.org/species/${gbifMatch.usageKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-verde-musgo hover:text-verde-escuro"
            >
              Ver no GBIF <ExternalLink size={12} />
            </a>
          </div>
          <p className="mt-1 text-xs text-verde-escuro/50">
            Fonte: Global Biodiversity Information Facility (gbif.org) ·{" "}
            {gbifCount.toLocaleString("pt-BR")} ocorrências registradas
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Reino", value: gbifMatch.kingdom },
              { label: "Filo", value: gbifMatch.phylum },
              { label: "Classe", value: gbifMatch.class },
              { label: "Ordem", value: gbifMatch.order },
              { label: "Família", value: gbifMatch.family },
              { label: "Gênero", value: gbifMatch.genus },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label} className="rounded-xl bg-verde-escuro/[0.04] p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-verde-escuro/50">
                    {f.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-verde-escuro">{f.value}</p>
                </div>
              ))}
          </div>

          {gbifImages.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-verde-escuro/50">
                Fotos reais de ocorrências registradas
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gbifImages.map((img, i) => (
                  <a
                    key={i}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-xl bg-areia"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- fontes externas variadas do GBIF, sem domínio fixo para next/image */}
                    <img
                      src={img.url}
                      alt={`Ocorrência de ${sp.scientificName}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {img.credit && (
                      <span className="absolute inset-x-0 bottom-0 truncate bg-verde-escuro/70 px-2 py-1 text-[10px] text-branco">
                        {img.credit}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-14 rounded-2xl bg-verde-escuro p-8 text-branco sm:p-10">
        <h2 className="font-display text-xl font-semibold text-verde-claro">Curiosidades</h2>
        <ul className="mt-4 space-y-2">
          {sp.funFacts.map((fact, i) => (
            <li key={i} className="flex gap-2 text-sm text-areia/85">
              <span className="text-verde-claro">•</span>
              {fact}
            </li>
          ))}
        </ul>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold text-verde-escuro">
            Espécies semelhantes
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {similar.map((s) => (
              <Link
                key={s.slug}
                href={`/especies/${s.slug}`}
                className="flex overflow-hidden rounded-2xl border border-verde-claro/25 bg-branco/90"
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-areia">
                  <Image src={s.images[0]} alt={s.popularName} fill sizes="112px" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-4">
                  <h3 className="font-display text-base font-semibold text-verde-escuro">
                    {s.popularName}
                  </h3>
                  <p className="text-xs italic text-verde-escuro/50">{s.scientificName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
