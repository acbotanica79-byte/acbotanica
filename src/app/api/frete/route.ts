import { NextRequest, NextResponse } from "next/server";
import { lookupCep, calcularFrete } from "@/lib/frete";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const cep = typeof body?.cep === "string" ? body.cep : "";
  const subtotal = typeof body?.subtotal === "number" ? body.subtotal : 0;

  try {
    const dest = await lookupCep(cep);
    const frete = calcularFrete(dest, subtotal);
    return NextResponse.json({
      ...frete,
      city: `${dest.localidade}/${dest.uf}`,
      localidade: dest.localidade,
      uf: dest.uf,
      logradouro: dest.logradouro,
      bairro: dest.bairro,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao calcular o frete";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
