import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const subtotal = typeof body?.subtotal === "number" ? body.subtotal : 0;

  const result = await validateCoupon(code, subtotal);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    code: result.coupon!.code,
    discountType: result.coupon!.discount_type,
    discount: result.discount,
  });
}
