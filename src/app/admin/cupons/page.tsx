import { createAdminClient } from "@/lib/supabase/admin";
import CuponsClient, { type AdminCoupon } from "@/components/admin/CuponsClient";

export default async function AdminCuponsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  const coupons: AdminCoupon[] = (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    active: row.active,
    minOrderValue: Number(row.min_order_value),
    usageLimit: row.usage_limit,
    timesUsed: row.times_used,
    expiresAt: row.expires_at,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Cupons</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">
        Crie cupons de desconto e ative ou desative quando quiser — sem precisar mexer em código.
      </p>
      <div className="mt-6">
        <CuponsClient initialCoupons={coupons} />
      </div>
    </div>
  );
}
