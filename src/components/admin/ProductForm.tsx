"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import { formatPrice } from "@/lib/utils";

export interface ProductFormValues {
  id?: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price: number | "";
  compare_at_price: number | "";
  cost_price: number | "";
  category_slug: string;
  subcategory: string;
  brand_slug: string;
  images: string;
  photo_note: string;
  tags: string;
  material: string;
  color: string;
  weight_grams: number | "";
  environments: string;
  related_slugs: string;
  featured: boolean;
  is_new: boolean;
}

const EMPTY: ProductFormValues = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  cost_price: "",
  category_slug: categories[0]?.slug ?? "",
  subcategory: "",
  brand_slug: brands[0]?.slug ?? "",
  images: "",
  photo_note: "",
  tags: "",
  material: "",
  color: "",
  weight_grams: "",
  environments: "",
  related_slugs: "",
  featured: false,
  is_new: false,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({ initial }: { initial?: Partial<ProductFormValues> }) {
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = Boolean(values.id);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const margin =
    values.price !== "" && values.cost_price !== ""
      ? Number(values.price) - Number(values.cost_price)
      : null;
  const marginPct = margin !== null && Number(values.price) > 0 ? (margin / Number(values.price)) * 100 : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      slug: values.slug || slugify(values.name),
      name: values.name,
      short_description: values.short_description,
      description: values.description,
      price: Number(values.price) || 0,
      compare_at_price: values.compare_at_price === "" ? null : Number(values.compare_at_price),
      cost_price: values.cost_price === "" ? null : Number(values.cost_price),
      category_slug: values.category_slug,
      subcategory: values.subcategory || null,
      brand_slug: values.brand_slug || null,
      images: values.images.split("\n").map((s) => s.trim()).filter(Boolean),
      photo_note: values.photo_note || null,
      tags: values.tags.split(",").map((s) => s.trim()).filter(Boolean),
      material: values.material || null,
      color: values.color || null,
      weight_grams: values.weight_grams === "" ? null : Number(values.weight_grams),
      environments: values.environments.split(",").map((s) => s.trim()).filter(Boolean),
      related_slugs: values.related_slugs.split(",").map((s) => s.trim()).filter(Boolean),
      featured: values.featured,
      is_new: values.is_new,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${values.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
      return;
    }
    router.push("/admin/produtos");
    router.refresh();
  }

  async function handleDelete() {
    if (!values.id || !confirm(`Excluir "${values.name}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${values.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/admin/produtos");
      router.refresh();
    } else {
      setError("Não foi possível excluir.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-verde-escuro">Nome</label>
          <input
            required
            value={values.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!isEdit) set("slug", slugify(e.target.value));
            }}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-verde-escuro">Slug (URL)</label>
          <input
            required
            value={values.slug}
            onChange={(e) => set("slug", slugify(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-verde-escuro">Descrição curta</label>
          <input
            required
            value={values.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-verde-escuro">Descrição completa</label>
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-verde-claro/30 bg-verde-escuro/[0.03] p-5">
        <p className="mb-4 text-sm font-semibold text-verde-escuro">Preço e margem</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-verde-escuro/70">Custo (fornecedor)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={values.cost_price}
              onChange={(e) => set("cost_price", e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-verde-escuro/70">Preço de venda *</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={values.price}
              onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-verde-escuro/70">Preço "de" (riscado)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={values.compare_at_price}
              onChange={(e) => set("compare_at_price", e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
        </div>
        {margin !== null && (
          <p className="mt-3 text-sm text-verde-escuro">
            Margem bruta:{" "}
            <strong className={margin >= 0 ? "text-verde-musgo" : "text-terracota"}>
              {formatPrice(margin)}
            </strong>
            {marginPct !== null && <span className="text-verde-escuro/60"> ({marginPct.toFixed(0)}%)</span>}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-verde-escuro">Categoria</label>
          <select
            value={values.category_slug}
            onChange={(e) => set("category_slug", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Subcategoria</label>
          <input
            value={values.subcategory}
            onChange={(e) => set("subcategory", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Marca</label>
          <select
            value={values.brand_slug}
            onChange={(e) => set("brand_slug", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          >
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Peso (gramas)</label>
          <input
            type="number"
            min="0"
            value={values.weight_grams}
            onChange={(e) => set("weight_grams", e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Material</label>
          <input
            value={values.material}
            onChange={(e) => set("material", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Cor</label>
          <input
            value={values.color}
            onChange={(e) => set("color", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-verde-escuro">Imagens (uma URL por linha)</label>
        <textarea
          rows={3}
          value={values.images}
          onChange={(e) => set("images", e.target.value)}
          placeholder="https://..."
          className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-verde-escuro">Aviso da foto (opcional)</label>
        <input
          value={values.photo_note}
          onChange={(e) => set("photo_note", e.target.value)}
          placeholder="Ex: foto ilustrativa da espécie"
          className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-verde-escuro">Tags (separadas por vírgula)</label>
          <input
            value={values.tags}
            onChange={(e) => set("tags", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Ambientes (separados por vírgula)</label>
          <input
            value={values.environments}
            onChange={(e) => set("environments", e.target.value)}
            placeholder="sala, escritório"
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-verde-escuro">Produtos relacionados (slugs, separados por vírgula)</label>
          <input
            value={values.related_slugs}
            onChange={(e) => set("related_slugs", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-verde-escuro">
          <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
          Destaque na home
        </label>
        <label className="flex items-center gap-2 text-sm text-verde-escuro">
          <input type="checkbox" checked={values.is_new} onChange={(e) => set("is_new", e.target.checked)} />
          Marcar como novidade
        </label>
      </div>

      {error && <p className="text-sm text-terracota">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-verde-escuro px-7 py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? "Salvar alterações" : "Criar produto"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-full border border-terracota/40 px-5 py-3 text-sm font-semibold text-terracota transition-colors hover:bg-terracota/10 disabled:opacity-50"
          >
            <Trash2 size={15} /> Excluir
          </button>
        )}
      </div>
    </form>
  );
}
