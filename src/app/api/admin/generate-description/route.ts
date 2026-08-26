import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { generateText, isGroqConfigured, GroqNotConfiguredError } from "@/lib/ai/groq";

const SYSTEM_PROMPT = `Você escreve textos de e-commerce para a ACCFG Botânica, uma loja premium brasileira de plantas, vasos e itens de jardinagem. Tom: caloroso, direto, sem exagero. Responda SOMENTE em JSON válido no formato {"shortDescription": "...", "description": "..."} — shortDescription com no máximo 120 caracteres (uma frase de vitrine), description com 2-3 parágrafos curtos destacando características, cuidados básicos (se for planta) ou uso (se for acessório), e por que vale a pena. Nunca invente características físicas específicas (tamanho exato, cor exata) que não foram informadas — fique no genérico nesses casos.`;

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  if (!(await isGroqConfigured())) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Informe o nome do produto." }, { status: 400 });

  const details = [
    body?.categorySlug && `categoria: ${body.categorySlug}`,
    body?.material && `material: ${body.material}`,
    body?.color && `cor: ${body.color}`,
    body?.tags && `tags: ${body.tags}`,
  ]
    .filter(Boolean)
    .join(", ");

  const userPrompt = `Produto: "${name}"${details ? `. Detalhes conhecidos: ${details}.` : ""} Gere o JSON pedido.`;

  try {
    const raw = await generateText(SYSTEM_PROMPT, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Resposta da IA não veio em JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      shortDescription: parsed.shortDescription ?? "",
      description: parsed.description ?? "",
    });
  } catch (err) {
    if (err instanceof GroqNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 501 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao gerar texto" }, { status: 502 });
  }
}
