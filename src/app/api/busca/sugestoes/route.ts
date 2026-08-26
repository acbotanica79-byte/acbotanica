import { NextRequest, NextResponse } from "next/server";
import { generateText, isGroqConfigured, GroqNotConfiguredError } from "@/lib/ai/groq";

const SYSTEM_PROMPT = `Você ajuda clientes a encontrar produtos numa loja brasileira de plantas, vasos e jardinagem. Você recebe a busca do cliente e uma lista de produtos disponíveis (nome e categoria). Responda SOMENTE em JSON válido no formato {"suggestions": ["nome exato de produto da lista", ...]}, com até 5 nomes que melhor combinam com o que o cliente procura — use seu conhecimento sobre plantas (necessidade de luz, água, ambiente, tamanho) quando a busca for descritiva (ex: "planta pra lugar escuro", "algo fácil de cuidar"). Só use nomes que aparecem EXATAMENTE como estão na lista fornecida, nunca invente produtos. Se nada combinar bem, retorne {"suggestions": []}.`;

const MAX_QUERY_LEN = 120;
const MAX_CATALOG_ITEMS = 200;

export async function POST(req: NextRequest) {
  if (!(await isGroqConfigured())) {
    return NextResponse.json({ suggestions: [] });
  }

  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, MAX_QUERY_LEN) : "";
  const catalog: { name: string; category: string }[] = Array.isArray(body?.catalog) ? body.catalog : [];

  if (!query || catalog.length === 0) return NextResponse.json({ suggestions: [] });

  const list = catalog
    .slice(0, MAX_CATALOG_ITEMS)
    .map((p) => `${p.name} (${p.category})`)
    .join("; ");
  const userPrompt = `Busca do cliente: "${query}"\nProdutos disponíveis: ${list}`;

  try {
    const raw = await generateText(SYSTEM_PROMPT, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ suggestions: [] });
    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((s: unknown): s is string => typeof s === "string").slice(0, 5)
      : [];
    return NextResponse.json({ suggestions });
  } catch (err) {
    if (err instanceof GroqNotConfiguredError) return NextResponse.json({ suggestions: [] });
    console.error("busca/sugestoes failed", err);
    return NextResponse.json({ suggestions: [] });
  }
}
