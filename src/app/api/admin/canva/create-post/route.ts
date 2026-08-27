import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAutofillDesign, uploadImageAsset } from "@/lib/canva";
import { getSetting } from "@/lib/settings";
import { getProductBySlug } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slug = body?.slug as string | undefined;
  if (!slug) return NextResponse.json({ error: "Produto não informado." }, { status: 400 });

  const brandTemplateId = await getSetting("CANVA_BRAND_TEMPLATE_ID");
  if (!brandTemplateId) {
    return NextResponse.json(
      { error: "Configure o CANVA_BRAND_TEMPLATE_ID em Integrações (ID do template de post na Canva)." },
      { status: 400 }
    );
  }

  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  if (!product.images?.[0]) {
    return NextResponse.json({ error: "Produto sem foto cadastrada." }, { status: 400 });
  }

  try {
    const assetId = await uploadImageAsset(product.images[0], product.slug);

    const hasPromo = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPct = hasPromo
      ? Math.round(100 - (product.price / product.compareAtPrice!) * 100)
      : null;

    const { editUrl } = await createAutofillDesign(
      brandTemplateId,
      {
        product_image: { type: "image", asset_id: assetId },
        product_name: { type: "text", text: product.name },
        product_price: { type: "text", text: formatPrice(product.price) },
        product_old_price: { type: "text", text: hasPromo ? formatPrice(product.compareAtPrice!) : "" },
        product_discount: { type: "text", text: discountPct ? `-${discountPct}%` : "" },
      },
      `Post - ${product.name}`
    );

    return NextResponse.json({ editUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar o post." },
      { status: 500 }
    );
  }
}
