/**
 * Referência curada de fornecedores/marketplaces reais e estabelecidos no
 * Brasil, por categoria — para o painel admin usar na hora de decidir onde
 * comprar cada item de um pedido.
 *
 * IMPORTANTE: isto NÃO é uma integração automática (não há API conectada a
 * nenhum desses fornecedores) e NÃO é garantia de preço, estoque ou de que
 * a empresa vai continuar operando — é um ponto de partida para pesquisa
 * manual, com empresas que têm histórico e presença de mercado consolidados
 * no momento em que isso foi pesquisado (2026).
 */
export interface SupplierRef {
  name: string;
  url: string;
  categories: string[];
  notes: string;
}

export const suppliers: SupplierRef[] = [
  {
    name: "Veiling Holambra",
    url: "https://veiling.com.br",
    categories: ["plantas", "suculentas", "cactos", "decoracao"],
    notes:
      "Maior cooperativa/mercado atacadista de flores e plantas do Brasil, ~400 produtores associados, compra online em tempo real (Veiling Online). Exige CNPJ para cadastro — é o hub para quando o negócio formalizar.",
  },
  {
    name: "Viveiro Rosário",
    url: "https://www.viveirorosario.com.br",
    categories: ["plantas", "ferramentas"],
    notes: "Super atacado de mudas frutíferas, plantas ornamentais e acessórios de jardinagem.",
  },
  {
    name: "Espinhaço",
    url: "https://www.espinhaco.com/sobre/atacado",
    categories: ["plantas", "cactos", "suculentas"],
    notes: "Plantas raras em volume para paisagistas, floristas e revenda.",
  },
  {
    name: "Suculentas Holambra",
    url: "https://www.suculentasholambra.com.br",
    categories: ["suculentas", "cactos"],
    notes: "Especializada em suculentas e cactos, preços competitivos.",
  },
  {
    name: "Paraíso das Suculentas",
    url: "https://www.paraisodassuculentas.com.br",
    categories: ["suculentas"],
    notes: "Preço de atacado disponível para revenda.",
  },
  {
    name: "Amantiquira",
    url: "https://www.amantiquira.com/atacado",
    categories: ["suculentas", "plantas"],
    notes: "Atende revendedores de plantas e projetos de cultivo.",
  },
  {
    name: "Máximo Vasos",
    url: "https://maximovasos.com.br",
    categories: ["vasos"],
    notes: "Fábrica de vasos de cerâmica/barro há mais de 30 anos, no polo cerâmico do país.",
  },
  {
    name: "Cerâmica Burguina",
    url: "https://ceramicaburguina.com.br",
    categories: ["vasos"],
    notes: "Fábrica de vasos de cerâmica e acessórios para jardim.",
  },
  {
    name: "FG Import",
    url: "https://www.fgimport.com.br",
    categories: ["ferramentas", "regadores-pulverizadores", "vasos"],
    notes: "Fabricante/importadora de acessórios de jardinagem (vasos, regadores, ferramentas).",
  },
  {
    name: "Mercado Livre (atacado)",
    url: "https://lista.mercadolivre.com.br/vasos-para-suculentas-por-atacado",
    categories: ["vasos", "suculentas", "ferramentas", "substratos", "terrarios"],
    notes:
      "Sem CNPJ ainda ou precisa de pouca quantidade? Comece aqui — cobertura nacional e compra imediata, preço geralmente maior que direto de fábrica.",
  },
  {
    name: "CJ Dropshipping",
    url: "https://cjdropshipping.com",
    categories: ["vasos", "ferramentas", "regadores-pulverizadores", "iluminacao-grow", "terrarios", "suportes-cachepos", "decoracao"],
    notes:
      "API gratuita real (produto, estoque, pedido, frete) — mas é fornecedor internacional (majoritariamente China), sem plantas vivas, e o frete/prazo até o Brasil costuma ser longo. Só vale a pena para itens não-vivos (vasos, ferramentas, iluminação). Precisa criar conta e gerar apiKey em cjdropshipping.com para a busca ficar ativa no admin.",
  },
  {
    name: "DropNexo",
    url: "https://dropnexo.com.br",
    categories: ["vasos", "suculentas", "ferramentas"],
    notes:
      "Plataforma brasileira com plano Starter gratuito e catálogo próprio. Não tem API pública documentada — uso é manual pelo painel deles, não dá para integrar direto no código.",
  },
  {
    name: "Droyp",
    url: "https://droyp.com.br",
    categories: ["vasos", "suculentas", "ferramentas", "decoracao"],
    notes:
      "Plataforma de dropshipping nacional com plano Free. Sem API pública conhecida — também é uso manual pelo painel deles.",
  },
];

export function getSuppliersForCategory(categorySlug: string) {
  return suppliers.filter((s) => s.categories.includes(categorySlug));
}
