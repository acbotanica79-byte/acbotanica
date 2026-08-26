import "server-only";
import { getSetting, isSettingConfigured } from "@/lib/settings";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export class GroqNotConfiguredError extends Error {
  constructor() {
    super("GROQ_API_KEY não configurada.");
    this.name = "GroqNotConfiguredError";
  }
}

export async function isGroqConfigured() {
  return isSettingConfigured("GROQ_API_KEY");
}

export async function generateText(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = await getSetting("GROQ_API_KEY");
  if (!key) throw new GroqNotConfiguredError();

  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API falhou: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq API retornou resposta vazia");
  return content.trim();
}
