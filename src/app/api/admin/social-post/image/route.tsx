import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { getProductBySlug } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";

const SIZE = 1080;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return new Response("Não autorizado.", { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return new Response("Produto não informado.", { status: 400 });

  const product = await getProductBySlug(slug);
  if (!product) return new Response("Produto não encontrado.", { status: 404 });
  if (!product.images?.[0]) return new Response("Produto sem foto.", { status: 400 });

  const hasPromo = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discountPct = hasPromo ? Math.round(100 - (product.price / product.compareAtPrice!) * 100) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1b4332",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "relative", width: SIZE, height: 700, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            width={SIZE}
            height={700}
            style={{ objectFit: "cover" }}
          />
          {hasPromo && (
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 36,
                display: "flex",
                alignItems: "center",
                backgroundColor: "#c77d4a",
                color: "#ffffff",
                fontSize: 34,
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: 999,
                letterSpacing: 1,
              }}
            >
              PROMOÇÃO -{discountPct}%
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 36,
              display: "flex",
              backgroundColor: "rgba(27,67,50,0.85)",
              color: "#f8f9fa",
              fontSize: 30,
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: 999,
            }}
          >
            AC Botânica
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#f8f9fa",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {product.name}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ display: "flex", color: "#f8f9fa", fontSize: 64, fontWeight: 800 }}>
              {formatPrice(product.price)}
            </div>
            {hasPromo && (
              <div
                style={{
                  display: "flex",
                  color: "#c9a66b",
                  fontSize: 36,
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(product.compareAtPrice!)}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
