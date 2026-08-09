import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { Product } from "@/lib/types";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  images: string[];
  photo_note: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  cost_price: number | string | null;
  brand_slug: string | null;
  category_slug: string;
  subcategory: string | null;
  tags: string[];
  weight_grams: number | null;
  dimensions: Product["dimensions"] | null;
  material: string | null;
  color: string | null;
  environments: string[];
  rating: number | string;
  review_count: number;
  reviews: Product["reviews"];
  qa: Product["qa"];
  related_slugs: string[];
  featured: boolean;
  is_new: boolean;
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    images: row.images ?? [],
    photoNote: row.photo_note ?? undefined,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    brandSlug: row.brand_slug ?? "",
    categorySlug: row.category_slug,
    subcategory: row.subcategory ?? undefined,
    tags: row.tags ?? [],
    weightGrams: row.weight_grams ?? undefined,
    dimensions: row.dimensions ?? undefined,
    material: row.material ?? undefined,
    color: row.color ?? undefined,
    environments: row.environments ?? [],
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    reviews: row.reviews ?? [],
    qa: row.qa ?? [],
    relatedSlugs: row.related_slugs ?? [],
    featured: row.featured ?? false,
    isNew: row.is_new ?? false,
  };
}

/** Cost price é dado só para o admin (margem/sourcing) — nunca vai pro Product público. */
export async function getProductsWithCost(): Promise<(Product & { costPrice?: number })[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) {
    console.error("getProductsWithCost failed", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...mapRow(row as ProductRow),
    costPrice: row.cost_price != null ? Number(row.cost_price) : undefined,
  }));
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) {
    console.error("getProducts failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapRow(row as ProductRow));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function getNewProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.isNew);
}

export async function getProductRowById(id: string): Promise<ProductRow | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return data as ProductRow;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return undefined;
  return mapRow(data as ProductRow);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const products = await getProducts();
  return product.relatedSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const products = await getProducts();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.categorySlug.toLowerCase().includes(q)
  );
}
