export const SITE_NAME = "ACCFG Botânica";
export const SITE_OWNER = "Aline Cristina Corrêa Faravallo";
// accfgbotanica.com.br ainda não foi registrado/apontado — usando a URL real da Vercel
// até o domínio próprio existir de verdade. Troque aqui assim que o domínio estiver no ar.
export const SITE_URL = "https://acbotanica.vercel.app";
export const SITE_DESCRIPTION =
  "Loja online premium de plantas, suculentas, vasos artesanais e artigos de jardinagem. Curadoria botânica por Aline Cristina Correia, com guias de cuidado e espécies selecionadas.";

export const WHATSAPP_NUMBER = "5511985125393";
export const PHONE_DISPLAY = "(11) 98512-5393";
export const CONTACT_EMAIL = "acbotanica79@gmail.com";
export const FREE_SHIPPING_THRESHOLD = 199;
export const WAREHOUSE_UF = "SP";
/** CEP real de origem do frete — nunca exibir para o cliente, só usar internamente pro cálculo de distância. */
export const WAREHOUSE_CEP = "08715420";

export const MAIN_NAV = [
  { label: "Suculentas", href: "/categorias/suculentas" },
  { label: "Cactos", href: "/categorias/cactos" },
  { label: "Vasos", href: "/categorias/vasos" },
  { label: "Kits", href: "/categorias/presentes-kits" },
  { label: "Jardinagem", href: "/categorias/ferramentas" },
  { label: "Decoração", href: "/categorias/decoracao" },
  { label: "Ofertas", href: "/promocoes" },
  { label: "Comunidade", href: "/comunidade" },
  { label: "Contato", href: "/contato" },
] as const;

export const UTILITY_NAV = [
  { label: "Minha Conta", href: "/conta" },
  { label: "Favoritos", href: "/favoritos" },
  { label: "Carrinho", href: "/carrinho" },
] as const;
