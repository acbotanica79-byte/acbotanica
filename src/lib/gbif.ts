import "server-only";
import { SITE_URL } from "@/lib/constants";

const GBIF_USER_AGENT = `AC Botanica (${SITE_URL})`;
const DAY = 60 * 60 * 24;

export interface GbifMatch {
  usageKey: number;
  scientificName: string;
  canonicalName: string;
  rank: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  confidence: number;
  synonym: boolean;
}

export interface GbifImage {
  url: string;
  credit?: string;
  license?: string;
  country?: string;
}

/** Resolve um nome científico para o registro taxonômico oficial do GBIF. Não requer chave. */
export async function matchSpecies(scientificName: string): Promise<GbifMatch | null> {
  try {
    const res = await fetch(
      `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&strict=false`,
      { headers: { "User-Agent": GBIF_USER_AGENT }, next: { revalidate: DAY * 7 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.usageKey || data.matchType === "NONE") return null;

    return {
      usageKey: data.usageKey,
      scientificName: data.scientificName,
      canonicalName: data.canonicalName,
      rank: data.rank,
      kingdom: data.kingdom,
      phylum: data.phylum,
      class: data.class,
      order: data.order,
      family: data.family,
      genus: data.genus,
      confidence: data.confidence,
      synonym: Boolean(data.synonym),
    };
  } catch {
    return null;
  }
}

/** Fotos reais de ocorrências registradas no GBIF para a espécie, com atribuição. */
export async function getSpeciesImages(usageKey: number, limit = 4): Promise<GbifImage[]> {
  try {
    const res = await fetch(
      `https://api.gbif.org/v1/occurrence/search?taxonKey=${usageKey}&mediaType=StillImage&limit=${limit}`,
      { headers: { "User-Agent": GBIF_USER_AGENT }, next: { revalidate: DAY * 7 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const images: GbifImage[] = [];

    for (const record of data.results ?? []) {
      for (const media of record.media ?? []) {
        if (media.type === "StillImage" && media.identifier && images.length < limit) {
          images.push({
            url: media.identifier,
            credit: media.rightsHolder || media.creator || record.recordedBy,
            license: media.license,
            country: record.country,
          });
        }
      }
    }
    return images;
  } catch {
    return [];
  }
}

/** Quantas ocorrências dessa espécie já foram registradas na base do GBIF. */
export async function getOccurrenceCount(usageKey: number): Promise<number> {
  try {
    const res = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${usageKey}&limit=0`, {
      headers: { "User-Agent": GBIF_USER_AGENT },
      next: { revalidate: DAY },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}
