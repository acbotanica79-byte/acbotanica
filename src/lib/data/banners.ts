import { Banner } from "@/lib/types";
import { IMG } from "./images";

export const banners: Banner[] = [
  {
    id: "banner-suculentas",
    title: "Suculentas",
    subtitle: "Coleção curada de suculentas raras e resistentes",
    image: IMG.succulentArrangement,
    href: "/categorias/suculentas",
    cta: "Ver coleção",
  },
  {
    id: "banner-vasos",
    title: "Vasos Premium",
    subtitle: "Cerâmica artesanal e design atemporal",
    image: IMG.potStack,
    href: "/categorias/vasos",
    cta: "Explorar vasos",
  },
  {
    id: "banner-ferramentas",
    title: "Ferramentas",
    subtitle: "Equipamentos profissionais para o seu jardim",
    image: IMG.gardenTools,
    href: "/categorias/ferramentas",
    cta: "Ver ferramentas",
  },
  {
    id: "banner-terrarios",
    title: "Terrários",
    subtitle: "Mundos em miniatura para qualquer ambiente",
    image: IMG.terrarium,
    href: "/categorias/terrarios",
    cta: "Montar meu terrário",
  },
  {
    id: "banner-jardim-vertical",
    title: "Jardim Vertical",
    subtitle: "Transforme paredes em floresta viva",
    image: IMG.hangingPlant,
    href: "/categorias/decoracao",
    cta: "Descobrir mais",
  },
];
