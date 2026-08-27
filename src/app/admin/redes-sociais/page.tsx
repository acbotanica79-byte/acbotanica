import { getProducts } from "@/lib/data/products";
import SocialPostClient from "@/components/admin/SocialPostClient";

export default async function AdminRedesSociaisPage() {
  const products = await getProducts();
  const activeProducts = products
    .filter((p) => p.images?.[0])
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
    }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Redes Sociais</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">
        Selecione produtos ativos (em promoção ou não) e gere automaticamente um post pronto para editar
        na Canva.
      </p>
      <div className="mt-6 max-w-4xl">
        <SocialPostClient products={activeProducts} />
      </div>
    </div>
  );
}
