import { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-plantas",
    slug: "plantas",
    name: "Plantas",
    description: "Plantas de folhagem, floríferas e ornamentais para todos os ambientes.",
    image: "https://images.pexels.com/photos/8743845/pexels-photo-8743845.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-suculentas",
    slug: "suculentas",
    name: "Suculentas",
    description: "Suculentas raras e clássicas, fáceis de cuidar e cheias de personalidade.",
    image: "https://images.pexels.com/photos/9814089/pexels-photo-9814089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-cactos",
    slug: "cactos",
    name: "Cactos",
    description: "Cactos de todos os formatos, do mini ao estatuto de peça de decoração.",
    image: "https://images.pexels.com/photos/7623077/pexels-photo-7623077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-vasos",
    slug: "vasos",
    name: "Vasos",
    description: "Vasos premium em cerâmica, cimento, fibra e materiais sustentáveis.",
    image: "https://images.pexels.com/photos/35669377/pexels-photo-35669377.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-ferramentas",
    slug: "ferramentas",
    name: "Ferramentas",
    description: "Ferramentas de jardinagem profissionais e domésticas.",
    image: "https://images.pexels.com/photos/6231715/pexels-photo-6231715.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-substratos",
    slug: "substratos",
    name: "Terra & Substratos",
    description: "Substratos especializados para cada tipo de planta.",
    image: "https://images.pexels.com/photos/5830958/pexels-photo-5830958.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-adubos",
    slug: "adubos-fertilizantes",
    name: "Adubos & Fertilizantes",
    description: "Nutrição completa para o crescimento saudável das suas plantas.",
    image: "https://images.pexels.com/photos/9413736/pexels-photo-9413736.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-pedras",
    slug: "pedras-musgos",
    name: "Pedras & Musgos",
    description: "Elementos decorativos naturais para terrários e vasos.",
    image: "https://images.pexels.com/photos/4751984/pexels-photo-4751984.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-terrarios",
    slug: "terrarios",
    name: "Terrários",
    description: "Terrários prontos e kits para montar o seu próprio mini jardim.",
    image: "https://images.pexels.com/photos/11015220/pexels-photo-11015220.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-regadores",
    slug: "regadores-pulverizadores",
    name: "Regadores & Pulverizadores",
    description: "Regadores e borrifadores de design para o dia a dia do cuidado.",
    image: "https://images.pexels.com/photos/12215560/pexels-photo-12215560.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-suportes",
    slug: "suportes-cachepos",
    name: "Suportes & Cachepôs",
    description: "Suportes, cachepôs e macramês para elevar suas plantas.",
    image: "https://images.pexels.com/photos/7649508/pexels-photo-7649508.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-iluminacao",
    slug: "iluminacao-grow",
    name: "Iluminação Grow",
    description: "Luzes de crescimento para plantas em ambientes internos.",
    image: "https://images.pexels.com/photos/28129603/pexels-photo-28129603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-decoracao",
    slug: "decoracao",
    name: "Decoração",
    description: "Peças decorativas com inspiração botânica para todos os cantos da casa.",
    image: "https://images.pexels.com/photos/6207491/pexels-photo-6207491.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-presentes",
    slug: "presentes-kits",
    name: "Presentes & Kits",
    description: "Kits prontos para presentear quem ama plantas.",
    image: "https://images.pexels.com/photos/3014862/pexels-photo-3014862.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "cat-livros",
    slug: "livros",
    name: "Livros",
    description: "Literatura especializada em botânica, paisagismo e jardinagem.",
    image: "https://images.pexels.com/photos/6231721/pexels-photo-6231721.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
