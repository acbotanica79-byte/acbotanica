import { NextRequest, NextResponse } from "next/server";
import { lookupCep, calcularFrete, calcularFreteCarrinho, type CartFreightItem } from "@/lib/frete";
import { createAdminClient } from "@/lib/supabase/admin";

interface CartItemInput {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const cep = typeof body?.cep === "string" ? body.cep : "";
  const subtotal = typeof body?.subtotal === "number" ? body.subtotal : 0;
  const items: CartItemInput[] = Array.isArray(body?.items) ? body.items : [];

  try {
    const dest = await lookupCep(cep);

    if (items.length === 0) {
      const frete = await calcularFrete(dest, subtotal);
      return NextResponse.json({
        lines: [
          {
            origin: "deposito",
            label: "Depósito ACCFG Botânica",
            price: frete.price,
            free: frete.free,
            minDays: frete.minDays,
            maxDays: frete.maxDays,
            zoneLabel: frete.zoneLabel,
            distanceKm: frete.distanceKm,
          },
        ],
        totalPrice: frete.price,
        city: `${dest.localidade}/${dest.uf}`,
        localidade: dest.localidade,
        uf: dest.uf,
        logradouro: dest.logradouro,
        bairro: dest.bairro,
      });
    }

    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const supabase = createAdminClient();
    const { data: products } = await supabase
      .from("products")
      .select("id, product_type, supplier_uf, supplier_cep, supplier_international")
      .in("id", productIds);
    const productById = new Map((products ?? []).map((p) => [p.id, p]));

    const cartItems: CartFreightItem[] = items.map((i) => {
      const product = productById.get(i.productId);
      return {
        productId: i.productId,
        quantity: i.quantity,
        productType: product?.product_type ?? "dropshipping",
        supplierCep: product?.supplier_cep,
        supplierUf: product?.supplier_uf,
        supplierInternational: product?.supplier_international ?? false,
      };
    });

    const lines = await calcularFreteCarrinho(dest, subtotal, cartItems);
    const totalPrice = lines.reduce((sum, l) => sum + l.price, 0);

    return NextResponse.json({
      lines,
      totalPrice,
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
