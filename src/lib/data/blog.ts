import { BlogPost } from "@/lib/types";
import { IMG } from "./images";

export const blogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "como-cuidar-de-suculentas",
    title: "Como cuidar de suculentas: o guia definitivo",
    excerpt:
      "Descubra os segredos para manter suas suculentas saudáveis, coloridas e cheias de vida durante o ano todo.",
    content:
      "Suculentas armazenam água em suas folhas, o que significa que regas em excesso são o erro mais comum de quem começa a cultivá-las. Regue apenas quando o substrato estiver completamente seco, garanta pelo menos 4 horas de luz direta ou indireta forte por dia, e use sempre um vaso com furo de drenagem. Substratos minerais, com areia grossa e perlita, evitam o apodrecimento das raízes.",
    image: IMG.succulentArrangement,
    author: "Marina Costa",
    category: "Cuidados",
    readMinutes: 6,
    date: "2026-07-15",
    relatedSlugs: ["montando-terrario-fechado", "erros-comuns-jardinagem"],
  },
  {
    id: "post-2",
    slug: "montando-terrario-fechado",
    title: "Passo a passo: montando seu primeiro terrário fechado",
    excerpt:
      "Um mini ecossistema autossustentável em um vidro. Aprenda a montar o seu em poucos passos.",
    content:
      "Comece com uma camada de drenagem (pedras ou argila expandida), seguida de carvão ativado para evitar fungos, e depois o substrato específico para terrários. Escolha plantas de crescimento lento como musgos, fittonias e peperômias. Feche o vidro e observe: em ambientes bem equilibrados, o terrário praticamente se rega sozinho através do ciclo da água.",
    image: IMG.terrarium,
    author: "Rafael Lima",
    category: "DIY",
    readMinutes: 8,
    date: "2026-07-02",
    relatedSlugs: ["como-cuidar-de-suculentas", "plantas-para-apartamentos-pequenos"],
  },
  {
    id: "post-3",
    slug: "plantas-para-apartamentos-pequenos",
    title: "10 plantas perfeitas para apartamentos pequenos",
    excerpt:
      "Pouco espaço não é desculpa: conheça espécies compactas que trazem vida para qualquer cantinho.",
    content:
      "Zamioculcas, sansevierias e peperômias são ótimas escolhas por ocuparem pouco espaço e tolerarem baixa luminosidade. Suportes verticais e prateleiras aproveitam o pé direito, enquanto vasos suspensos liberam espaço no chão. Priorize espécies de crescimento lento para reduzir a necessidade de trocas frequentes de vaso.",
    image: IMG.plantsWindowsill,
    author: "Marina Costa",
    category: "Paisagismo",
    readMinutes: 5,
    date: "2026-06-20",
    relatedSlugs: ["montando-terrario-fechado", "erros-comuns-jardinagem"],
  },
  {
    id: "post-4",
    slug: "erros-comuns-jardinagem",
    title: "7 erros comuns de quem está começando na jardinagem",
    excerpt:
      "Do excesso de rega à escolha errada do vaso: veja os deslizes mais frequentes e como evitá-los.",
    content:
      "O erro mais comum é regar em excesso — mais plantas morrem afogadas do que sedentas. Outro deslize frequente é usar vasos sem furo de drenagem, ou substrato inadequado para o tipo de planta. Também é importante observar a quantidade de luz real do ambiente antes de escolher uma espécie, e sempre pesquisar sobre toxicidade se houver pets ou crianças em casa.",
    image: IMG.gardenBed,
    author: "Rafael Lima",
    category: "Guias",
    readMinutes: 7,
    date: "2026-06-05",
    relatedSlugs: ["como-cuidar-de-suculentas", "plantas-para-apartamentos-pequenos"],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
