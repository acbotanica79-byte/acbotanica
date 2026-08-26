import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

export interface CouponRow {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
  min_order_value: number;
  usage_limit: number | null;
  times_used: number;
  expires_at: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: CouponRow;
  discount?: number;
}

/**
 * Sempre revalida no servidor a partir do subtotal calculado ali mesmo — nunca
 * confia num desconto vindo do cliente. Usado tanto na prévia do carrinho
 * quanto (de novo, por segurança) na hora de fechar o pedido.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, error: "Informe um cupom." };

  const supabase = createAdminClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle<CouponRow>();

  if (!coupon) return { valid: false, error: "Cupom não encontrado." };
  if (!coupon.active) return { valid: false, error: "Este cupom não está mais ativo." };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: "Este cupom expirou." };
  }
  if (coupon.usage_limit != null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: "Este cupom já atingiu o limite de usos." };
  }
  if (subtotal < coupon.min_order_value) {
    return { valid: false, error: `Pedido mínimo de ${formatPrice(coupon.min_order_value)} pra usar esse cupom.` };
  }

  const rawDiscount =
    coupon.discount_type === "percent" ? subtotal * (coupon.discount_value / 100) : coupon.discount_value;
  const discount = Math.min(Math.round(rawDiscount * 100) / 100, subtotal);

  return { valid: true, coupon, discount };
}

/** Incrementa o contador de uso — chamado só ao criar o pedido de fato (não na prévia). */
export async function registerCouponUsage(couponId: string, currentTimesUsed: number) {
  const supabase = createAdminClient();
  await supabase.from("coupons").update({ times_used: currentTimesUsed + 1 }).eq("id", couponId);
}
