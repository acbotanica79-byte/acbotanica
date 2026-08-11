import "server-only";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("GOOGLE_API_KEY não configurada.");
    this.name = "GeminiNotConfiguredError";
  }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GOOGLE_API_KEY);
}

export interface PlantIdentification {
  popularName: string;
  scientificName: string;
  confidence: "alta" | "média" | "baixa";
  family: string | null;
  careTips: string;
  isPlant: boolean;
}

const IDENTIFY_PROMPT = `Você é um botânico identificando plantas a partir de fotos para uma loja de plantas brasileira.
Analise a imagem e responda SOMENTE em JSON válido, sem markdown, no formato exato:
{"isPlant": true, "popularName": "nome popular em português", "scientificName": "nome científico", "family": "família botânica ou null", "confidence": "alta" | "média" | "baixa", "careTips": "2-3 frases curtas em português sobre luz, rega e cuidado básico desta espécie"}
Se a imagem não mostrar uma planta reconhecível, responda {"isPlant": false, "popularName": "", "scientificName": "", "family": null, "confidence": "baixa", "careTips": "Não foi possível identificar uma planta nessa foto. Tente outra imagem com mais luz e foco nas folhas."}
Nunca invente uma espécie com confiança "alta" se não tiver certeza — nesse caso responda "média" ou "baixa".`;

export async function identifyPlant(imageBase64: string, mimeType: string): Promise<PlantIdentification> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new GeminiNotConfiguredError();

  const res = await fetch(`${GEMINI_API}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: IDENTIFY_PROMPT },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        },
      ],
      // maxOutputTokens inclui os tokens de "thinking" do modelo (só nesse teste
      // já consumiu ~950 antes de escrever a resposta) — 500 truncava o JSON.
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API falhou: ${res.status} ${text}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API retornou resposta vazia");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Resposta da IA não veio em JSON");
  const parsed = JSON.parse(jsonMatch[0]);

  return {
    isPlant: Boolean(parsed.isPlant),
    popularName: parsed.popularName ?? "",
    scientificName: parsed.scientificName ?? "",
    family: parsed.family ?? null,
    confidence: ["alta", "média", "baixa"].includes(parsed.confidence) ? parsed.confidence : "baixa",
    careTips: parsed.careTips ?? "",
  };
}
