import { Category } from "@/lib/types";
import { IMG } from "./images";

export const categories: Category[] = [
  {
    id: "cat-plantas",
    slug: "plantas",
    name: "Plantas",
    description: "Plantas de folhagem, floríferas e ornamentais para todos os ambientes.",
    image: IMG.monsteraLeaves,
  },
  {
    id: "cat-suculentas",
    slug: "suculentas",
    name: "Suculentas",
    description: "Suculentas raras e clássicas, fáceis de cuidar e cheias de personalidade.",
    image: IMG.succulentsTop,
  },
  {
    id: "cat-cactos",
    slug: "cactos",
    name: "Cactos",
    description: "Cactos de todos os formatos, do mini ao estatuto de peça de decoração.",
    image: IMG.cactusGarden,
  },
  {
    id: "cat-vasos",
    slug: "vasos",
    name: "Vasos",
    description: "Vasos premium em cerâmica, cimento, fibra e materiais sustentáveis.",
    image: IMG.potStack,
  },
  {
    id: "cat-ferramentas",
    slug: "ferramentas",
    name: "Ferramentas",
    description: "Ferramentas de jardinagem profissionais e domésticas.",
    image: IMG.gardenTools,
  },
  {
    id: "cat-substratos",
    slug: "substratos",
    name: "Terra & Substratos",
    description: "Substratos especializados para cada tipo de planta.",
    image: IMG.gardenBed,
  },
  {
    id: "cat-adubos",
    slug: "adubos-fertilizantes",
    name: "Adubos & Fertilizantes",
    description: "Nutrição completa para o crescimento saudável das suas plantas.",
    image: IMG.plantWatering,
  },
  {
    id: "cat-pedras",
    slug: "pedras-musgos",
    name: "Pedras & Musgos",
    description: "Elementos decorativos naturais para terrários e vasos.",
    image: IMG.terrarium,
  },
  {
    id: "cat-terrarios",
    slug: "terrarios",
    name: "Terrários",
    description: "Terrários prontos e kits para montar o seu próprio mini jardim.",
    image: IMG.terrarium,
  },
  {
    id: "cat-regadores",
    slug: "regadores-pulverizadores",
    name: "Regadores & Pulverizadores",
    description: "Regadores e borrifadores de design para o dia a dia do cuidado.",
    image: IMG.plantWatering,
  },
  {
    id: "cat-suportes",
    slug: "suportes-cachepos",
    name: "Suportes & Cachepôs",
    description: "Suportes, cachepôs e macramês para elevar suas plantas.",
    image: IMG.hangingPlant,
  },
  {
    id: "cat-iluminacao",
    slug: "iluminacao-grow",
    name: "Iluminação Grow",
    description: "Luzes de crescimento para plantas em ambientes internos.",
    image: IMG.officePlants,
  },
  {
    id: "cat-decoracao",
    slug: "decoracao",
    name: "Decoração",
    description: "Peças decorativas com inspiração botânica para todos os cantos da casa.",
    image: IMG.livingRoomPlants,
  },
  {
    id: "cat-presentes",
    slug: "presentes-kits",
    name: "Presentes & Kits",
    description: "Kits prontos para presentear quem ama plantas.",
    image: IMG.plantShop,
  },
  {
    id: "cat-livros",
    slug: "livros",
    name: "Livros",
    description: "Literatura especializada em botânica, paisagismo e jardinagem.",
    image: IMG.plantShelf,
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
