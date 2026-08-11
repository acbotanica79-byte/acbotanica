import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createPreference } from "@/lib/mercadopago";
import { SITE_URL } from "@/lib/constants";

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
  const total = subtotal + shippingPrice;

  // Obter user_id se o cliente estiver logado
  const supabaseAuth = await createClient();
  const { data: { session } } = await supabaseAuth.auth.getSession();
  const userId = session?.user?.id || null;

  const supabase = createAdminClient();

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
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("order insert failed", orderError);
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  const orderItemsPayload = items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.name,
    product_slug: i.slug,
    unit_price: i.price,
    quantity: i.quantity,
  }));
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
      externalReference: order.id,
      payerEmail: customer.email,
      payerName: customer.name,
      siteUrl: SITE_URL,
    });

    return NextResponse.json({ orderNumber: order.order_number, checkoutUrl: preference.init_point });
  } catch (err) {
    console.error("mercadopago preference failed", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Pedido criado, mas não foi possível abrir o pagamento. Nossa equipe vai entrar em contato.",
        // TEMP: detalhe do erro real da API do Mercado Pago pra diagnostico. Remover depois de resolvido.
        debugDetail: detail,
      },
      { status: 502 }
    );
  }
}
