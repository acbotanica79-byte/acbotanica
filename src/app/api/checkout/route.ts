import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createPreference } from "@/lib/mercadopago";
import { SITE_URL } from "@/lib/constants";
import { validateCoupon, registerCouponUsage } from "@/lib/coupons";

interface CheckoutItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];
  const customer = body?.customer ?? {};
  const shipping = body?.shipping ?? {};
  const shippingPrice = Number(body?.shippingPrice) || 0;

  if (items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }
  if (!customer.name || !EMAIL_RE.test(customer.email ?? "")) {
    return NextResponse.json({ error: "Nome e e-mail válidos são obrigatórios." }, { status: 400 });
  }
  if (!shipping.cep || !shipping.address || !shipping.city || !shipping.uf) {
    return NextResponse.json({ error: "Endereço de entrega incompleto." }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Revalida o cupom aqui, do zero — nunca confia num desconto calculado no
  // cliente. Se o cupom não for mais válido (expirou, esgotou, etc. entre a
  // prévia no carrinho e o clique em pagar), o pedido segue sem desconto em
  // vez de travar o checkout.
  const couponCode = typeof body?.couponCode === "string" ? body.couponCode : null;
  let discount = 0;
  let validCoupon: Awaited<ReturnType<typeof validateCoupon>>["coupon"] | undefined;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if (result.valid) {
      discount = result.discount ?? 0;
      validCoupon = result.coupon;
    }
  }

  const total = Math.max(subtotal - discount, 0) + shippingPrice;

  // Obter user_id se o cliente estiver logado
  const supabaseAuth = await createClient();
  const { data: { session } } = await supabaseAuth.auth.getSession();
  const userId = session?.user?.id || null;

  const supabase = createAdminClient();

  // Confere e dá baixa no estoque dos produtos com controle próprio (product_type
  // "estoque") antes de criar o pedido — evita vender o que não existe. Produtos
  // "dropshipping" não têm controle de quantidade real, então passam direto.
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const { data: productRows } = await supabase
    .from("products")
    .select("id, product_type, stock_quantity, supplier_name, supplier_uf, supplier_cep, supplier_international")
    .in("id", productIds);
  const productById = new Map((productRows ?? []).map((p) => [p.id, p]));

  const decremented: string[] = [];
  for (const item of items) {
    const product = productById.get(item.productId);
    if (product?.product_type !== "estoque") continue;

    const { data: updated } = await supabase
      .from("products")
      .update({ stock_quantity: (product.stock_quantity ?? 0) - item.quantity })
      .eq("id", item.productId)
      .gte("stock_quantity", item.quantity)
      .select("id")
      .maybeSingle();

    if (!updated) {
      // Estoque insuficiente — desfaz as baixas já feitas nesse checkout antes de recusar.
      for (const id of decremented) {
        const original = productById.get(id);
        if (original) await supabase.from("products").update({ stock_quantity: original.stock_quantity }).eq("id", id);
      }
      return NextResponse.json({ error: `${item.name} está sem estoque suficiente.` }, { status: 400 });
    }
    decremented.push(item.productId);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone ?? null,
      shipping_cep: shipping.cep,
      shipping_address: shipping.address,
      shipping_number: shipping.number ?? null,
      shipping_complement: shipping.complement ?? null,
      shipping_neighborhood: shipping.neighborhood ?? null,
      shipping_city: shipping.city,
      shipping_uf: shipping.uf,
      shipping_price: shippingPrice,
      subtotal,
      total,
      coupon_code: validCoupon?.code ?? null,
      discount,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("order insert failed", orderError);
    for (const id of decremented) {
      const original = productById.get(id);
      if (original) await supabase.from("products").update({ stock_quantity: original.stock_quantity }).eq("id", id);
    }
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  if (validCoupon) {
    await registerCouponUsage(validCoupon.id, validCoupon.times_used);
  }

  if (userId) {
    // Client autenticado do usuário (RLS), não o admin: a tabela profiles não tem
    // grants para service_role no banco, então essa escrita falharia silenciosamente ali.
    const { error: profileError } = await supabaseAuth
      .from("profiles")
      .update({
        full_name: customer.name,
        phone: customer.phone ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (profileError) console.error("profile sync from checkout failed", profileError);
  }

  const orderItemsPayload = items.map((i) => {
    const product = productById.get(i.productId);
    const isDropshipping = product?.product_type !== "estoque";
    return {
      order_id: order.id,
      product_id: i.productId,
      product_name: i.name,
      product_slug: i.slug,
      unit_price: i.price,
      quantity: i.quantity,
      // Pré-preenche com o fornecedor padrão do produto — o admin ainda pode ajustar por pedido.
      supplier_name: isDropshipping ? product?.supplier_name ?? null : null,
      supplier_uf: isDropshipping ? product?.supplier_uf ?? null : null,
      supplier_cep: isDropshipping ? product?.supplier_cep ?? null : null,
      supplier_international: isDropshipping ? product?.supplier_international ?? false : false,
    };
  });
  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) {
    console.error("order_items insert failed", itemsError);
    return NextResponse.json({ error: "Não foi possível registrar os itens do pedido." }, { status: 500 });
  }

  try {
    const preference = await createPreference({
      items: items.map((i) => ({
        title: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        currency_id: "BRL",
      })),
      shipping: shippingPrice,
      discount,
      discountLabel: validCoupon?.code,
      externalReference: order.id,
      payerEmail: customer.email,
      payerName: customer.name,
      siteUrl: SITE_URL,
    });

    return NextResponse.json({ orderNumber: order.order_number, checkoutUrl: preference.init_point });
  } catch (err) {
    console.error("mercadopago preference failed", err);
    return NextResponse.json(
      { error: "Pedido criado, mas não foi possível abrir o pagamento. Nossa equipe vai entrar em contato." },
      { status: 502 }
    );
  }
}
