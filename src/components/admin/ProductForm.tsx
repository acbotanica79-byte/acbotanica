"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, Sparkles, Upload, X, Plus } from "lucide-react";
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
  supplier_url: string;
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
  product_type: "dropshipping" | "estoque";
  stock_quantity: number | "";
  supplier_name: string;
  supplier_uf: string;
  supplier_cep: string;
  supplier_international: boolean;
}

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const EMPTY: ProductFormValues = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  cost_price: "",
  supplier_url: "",
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
  product_type: "dropshipping",
  stock_quantity: "",
  supplier_name: "",
  supplier_uf: "",
  supplier_cep: "",
  supplier_international: false,
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
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = Boolean(values.id);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const imageList = useMemo(
    () => values.images.split("\n").map((s) => s.trim()).filter(Boolean),
    [values.images]
  );
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setImageError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "produtos");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.imageUrl) uploaded.push(data.imageUrl);
      else setImageError(data?.error ?? "Erro ao enviar uma das imagens.");
    }
    if (uploaded.length > 0) set("images", [...imageList, ...uploaded].join("\n"));
    setUploadingImages(false);
  }

  function removeImage(url: string) {
    set("images", imageList.filter((i) => i !== url).join("\n"));
  }

  function addPastedUrl() {
    if (!pastedUrl.trim()) return;
    set("images", [...imageList, pastedUrl.trim()].join("\n"));
    setPastedUrl("");
  }

  async function handleGenerateDescription() {
    if (!values.name.trim()) {
      setGenerateError("Preencha o nome do produto primeiro.");
      return;
    }
    setGenerating(true);
    setGenerateError(null);

    const res = await fetch("/api/admin/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        categorySlug: values.category_slug,
        material: values.material,
        color: values.color,
        tags: values.tags,
      }),
    });
    const data = await res.json().catch(() => null);
    setGenerating(false);

    if (!res.ok) {
      setGenerateError(
        data?.error === "not_configured"
          ? "GROQ_API_KEY não configurada — adicione no .env.local para ativar."
          : data?.error ?? "Não foi possível gerar o texto."
      );
      return;
    }
    if (data.shortDescription) set("short_description", data.shortDescription);
    if (data.description) set("description", data.description);
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
      supplier_url: values.supplier_url || null,
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
      product_type: values.product_type,
      stock_quantity: values.product_type === "estoque" ? Number(values.stock_quantity) || 0 : null,
      supplier_name: values.product_type === "dropshipping" ? values.supplier_name || null : null,
      supplier_uf: values.product_type === "dropshipping" && !values.supplier_international ? values.supplier_uf || null : null,
      supplier_cep: values.product_type === "dropshipping" && !values.supplier_international ? values.supplier_cep || null : null,
      supplier_international: values.product_type === "dropshipping" ? values.supplier_international : false,
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

        <div className="sm:col-span-2 flex items-center justify-between">
          <label className="text-sm font-medium text-verde-escuro">Descrição curta e completa</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-full border border-verde-musgo/40 px-3 py-1.5 text-xs font-semibold text-verde-musgo transition-colors hover:bg-verde-musgo/10 disabled:opacity-50"
          >
            {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Gerar com IA
          </button>
        </div>
        {generateError && <p className="sm:col-span-2 text-xs text-terracota">{generateError}</p>}
        <div className="sm:col-span-2">
          <input
            required
            value={values.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            placeholder="Descrição curta"
            className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Descrição completa"
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
            <label className="text-xs font-medium text-verde-escuro/70">Preço &quot;de&quot; (riscado)</label>
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
        <div className="mt-4">
          <label className="text-xs font-medium text-verde-escuro/70">
            Link do fornecedor (onde pesquisou/vai comprar)
          </label>
          <input
            type="url"
            value={values.supplier_url}
            onChange={(e) => set("supplier_url", e.target.value)}
            placeholder="https://..."
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-verde-claro/30 bg-verde-escuro/[0.03] p-5">
        <p className="mb-4 text-sm font-semibold text-verde-escuro">Estoque e fornecimento</p>
        <div className="flex gap-3">
          <label
            className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors ${
              values.product_type === "dropshipping"
                ? "border-verde-musgo bg-verde-claro/15 font-semibold text-verde-escuro"
                : "border-verde-claro/40 text-verde-escuro/70"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              checked={values.product_type === "dropshipping"}
              onChange={() => set("product_type", "dropshipping")}
            />
            Dropshipping (sem estoque físico)
          </label>
          <label
            className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors ${
              values.product_type === "estoque"
                ? "border-verde-musgo bg-verde-claro/15 font-semibold text-verde-escuro"
                : "border-verde-claro/40 text-verde-escuro/70"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              checked={values.product_type === "estoque"}
              onChange={() => set("product_type", "estoque")}
            />
            Estoque próprio
          </label>
        </div>

        {values.product_type === "estoque" ? (
          <div className="mt-4">
            <label className="text-xs font-medium text-verde-escuro/70">Quantidade em estoque *</label>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.stock_quantity}
              onChange={(e) => set("stock_quantity", e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1.5 w-40 rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
            />
            <p className="mt-2 text-xs text-verde-escuro/50">
              Some sozinha a cada pedido. Quando chegar a 0, a loja mostra &quot;Esgotado&quot; e bloqueia a compra.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-verde-escuro/50">
              Fornecedor padrão desse produto — pré-preenche o pedido no admin quando alguém compra (dá pra ajustar por pedido depois).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={values.supplier_name}
                onChange={(e) => set("supplier_name", e.target.value)}
                placeholder="Nome do fornecedor"
                className="rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
              <label className="flex items-center gap-2 text-sm text-verde-escuro/80">
                <input
                  type="checkbox"
                  checked={values.supplier_international}
                  onChange={(e) => set("supplier_international", e.target.checked)}
                />
                Fornecedor internacional
              </label>
              {!values.supplier_international && (
                <>
                  <select
                    value={values.supplier_uf}
                    onChange={(e) => set("supplier_uf", e.target.value)}
                    className="rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                  >
                    <option value="">UF do fornecedor</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  <input
                    value={values.supplier_cep}
                    onChange={(e) => set("supplier_cep", e.target.value)}
                    placeholder="CEP do fornecedor (opcional, mais preciso)"
                    className="rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                  />
                </>
              )}
            </div>
          </div>
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
        <label className="text-sm font-medium text-verde-escuro">Imagens</label>
        <p className="mt-0.5 text-xs text-verde-escuro/50">
          Envie fotos direto do celular ou computador — a primeira da lista é a foto principal.
        </p>

        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imageList.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-verde-claro/30 bg-areia">
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-verde-escuro/70 text-areia opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remover foto"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-verde-claro/50 text-verde-escuro/50 transition-colors hover:border-verde-musgo hover:text-verde-musgo disabled:opacity-50"
          >
            {uploadingImages ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-[11px] font-semibold">Enviar foto</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleImageFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {imageError && <p className="mt-2 text-xs text-terracota">{imageError}</p>}

        <div className="mt-3 flex items-center gap-2">
          <input
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPastedUrl();
              }
            }}
            placeholder="Ou cole a URL de uma foto (ex: link da CJ Dropshipping)"
            className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
          <button
            type="button"
            onClick={addPastedUrl}
            className="flex shrink-0 items-center gap-1 rounded-xl border border-verde-claro/50 px-3 py-2.5 text-sm font-semibold text-verde-escuro hover:bg-verde-claro/10"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
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
