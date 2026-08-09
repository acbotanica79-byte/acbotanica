import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductRowById } from "@/lib/data/products";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getProductRowById(id);
  if (!row) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Editar produto</h1>
      <div className="mt-6">
        <ProductForm
          initial={{
            id: row.id,
            slug: row.slug,
            name: row.name,
            short_description: row.short_description,
            description: row.description,
            price: Number(row.price),
            compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : "",
            cost_price: row.cost_price != null ? Number(row.cost_price) : "",
            category_slug: row.category_slug,
            subcategory: row.subcategory ?? "",
            brand_slug: row.brand_slug ?? "",
            images: (row.images ?? []).join("\n"),
            photo_note: row.photo_note ?? "",
            tags: (row.tags ?? []).join(", "),
            material: row.material ?? "",
            color: row.color ?? "",
            weight_grams: row.weight_grams ?? "",
            environments: (row.environments ?? []).join(", "),
            related_slugs: (row.related_slugs ?? []).join(", "),
            featured: row.featured,
            is_new: row.is_new,
          }}
        />
      </div>
    </div>
  );
}
