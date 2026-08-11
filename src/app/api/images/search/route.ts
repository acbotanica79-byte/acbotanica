import { NextRequest, NextResponse } from "next/server";
import { getBestImage } from "@/lib/images/engine";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Parâmetro ?q= é obrigatório" }, { status: 400 });
  }

  const image = await getBestImage(query.trim());
  if (!image) {
    return NextResponse.json({ error: "Nenhuma imagem encontrada" }, { status: 404 });
  }

  return NextResponse.json(image);
}
