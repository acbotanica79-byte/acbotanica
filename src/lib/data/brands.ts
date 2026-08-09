import { Brand } from "@/lib/types";

export const brands: Brand[] = [
  { id: "b-ac-botanica", slug: "ac-botanica-original", name: "AC Botânica Original" },
  { id: "b-terraviva", slug: "terraviva", name: "Terraviva" },
  { id: "b-vasoverde", slug: "vasoverde", name: "Vaso Verde" },
  { id: "b-jardimzen", slug: "jardim-zen", name: "Jardim Zen" },
  { id: "b-raizforte", slug: "raiz-forte", name: "Raiz Forte" },
  { id: "b-botanika", slug: "botanika", name: "Botânika Studio" },
];

export function getBrandBySlug(slug: string) {
  return brands.find((b) => b.slug === slug);
}
