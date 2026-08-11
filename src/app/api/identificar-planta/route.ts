import { NextRequest, NextResponse } from "next/server";
import { identifyPlant, isGeminiConfigured, GeminiNotConfiguredError } from "@/lib/ai/gemini";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie uma foto no campo 'photo'." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "O arquivo precisa ser uma imagem." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 10MB)." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await identifyPlant(bytes.toString("base64"), file.type);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 501 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao identificar a planta" },
      { status: 502 }
    );
  }
}
