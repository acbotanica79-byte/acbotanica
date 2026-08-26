"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save, Upload, Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import type { SiteTheme } from "@/lib/theme";
import type { AdminBanner } from "@/lib/data/siteBanners";

const COLOR_FIELDS: { key: keyof Pick<SiteTheme, "verdeEscuro" | "verdeMusgo" | "verdeClaro" | "areia" | "terracota" | "dourado">; label: string }[] = [
  { key: "verdeEscuro", label: "Verde escuro (primária)" },
  { key: "verdeMusgo", label: "Verde musgo (hover/destaque)" },
  { key: "verdeClaro", label: "Verde claro (fundo suave)" },
  { key: "areia", label: "Areia (fundo geral)" },
  { key: "terracota", label: "Terracota (alerta/erro)" },
  { key: "dourado", label: "Dourado (detalhe premium)" },
];

async function uploadImage(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erro ao enviar imagem.");
  return data.imageUrl;
}

export default function PersonalizacaoClient({
  initialTheme,
  initialBanners,
}: {
  initialTheme: SiteTheme;
  initialBanners: AdminBanner[];
}) {
  return (
    <div className="space-y-10">
      <ColorPaletteSection initialTheme={initialTheme} />
      <HeroSection initialTheme={initialTheme} />
      <BannersSection initialBanners={initialBanners} />
    </div>
  );
}

// ── Paleta de cores ──────────────────────────────────────────────────────

function ColorPaletteSection({ initialTheme }: { initialTheme: SiteTheme }) {
  const router = useRouter();
  const [colors, setColors] = useState(initialTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/admin/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(colors),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao salvar.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-verde-escuro">Paleta de cores</h2>
          <p className="mt-1 text-xs text-verde-escuro/55">
            Muda a cor em todo o site (loja e admin) assim que salvar — sem precisar mexer em código.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          Salvar paleta
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLOR_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center gap-3 rounded-xl border border-verde-claro/25 p-3">
            <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-verde-claro/40">
              <input
                type="color"
                value={colors[field.key]}
                onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer border-none p-0"
              />
            </label>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-verde-escuro/80">{field.label}</p>
              <input
                value={colors[field.key]}
                onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                maxLength={7}
                className="mt-0.5 w-full rounded-md border border-verde-claro/40 bg-branco px-2 py-1 text-xs font-mono text-verde-escuro/70 outline-none focus:border-verde-musgo"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Prévia isolada — não altera o resto da página enquanto você mexe */}
      <div
        className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border p-4"
        style={{ background: colors.areia, borderColor: colors.verdeClaro }}
      >
        <span className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: colors.verdeEscuro, color: colors.areia }}>
          Botão principal
        </span>
        <span className="rounded-full border-2 px-4 py-2 text-sm font-semibold" style={{ borderColor: colors.verdeMusgo, color: colors.verdeEscuro }}>
          Botão secundário
        </span>
        <span className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: colors.terracota, color: "#fff" }}>
          Alerta
        </span>
        <span className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: colors.dourado, color: colors.verdeEscuro }}>
          Destaque
        </span>
      </div>

      {error && <p className="mt-3 text-xs text-terracota">{error}</p>}
    </section>
  );
}

// ── Hero (banner principal da home) ─────────────────────────────────────

function HeroSection({ initialTheme }: { initialTheme: SiteTheme }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialTheme.heroImageUrl ?? "");
  const [headline, setHeadline] = useState(initialTheme.heroHeadline ?? "");
  const [subheadline, setSubheadline] = useState(initialTheme.heroSubheadline ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, "hero");
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/admin/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroImageUrl: imageUrl, heroHeadline: headline, heroSubheadline: subheadline }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao salvar.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-verde-escuro">Banner principal (topo da home)</h2>
          <p className="mt-1 text-xs text-verde-escuro/55">
            Deixe em branco pra usar a foto e os textos padrão do site.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          Salvar banner principal
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-verde-claro/30 bg-areia sm:h-full">
          {imageUrl ? (
            <Image src={imageUrl} alt="" fill sizes="160px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-verde-escuro/40">Foto padrão</div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center gap-1.5 bg-verde-escuro/0 text-xs font-semibold text-areia opacity-0 transition-opacity hover:bg-verde-escuro/60 hover:opacity-100"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Trocar foto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Título</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Mais Verde Começa Aqui"
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Subtítulo</label>
            <input
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              placeholder="Plantas, vasos artesanais e acessórios..."
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-terracota">{error}</p>}
    </section>
  );
}

// ── Banners do carrossel ────────────────────────────────────────────────

function emptyBanner(sortOrder: number): AdminBanner {
  return { id: "", imageUrl: "", title: "", subtitle: "", ctaLabel: "Ver mais", href: "/produtos", sortOrder, active: true };
}

function BannersSection({ initialBanners }: { initialBanners: AdminBanner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [draft, setDraft] = useState<AdminBanner | null>(null);
  const [uploadingDraft, setUploadingDraft] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function startNew() {
    setError(null);
    setDraft(emptyBanner(banners.length));
  }

  async function handleDraftFile(file: File) {
    if (!draft) return;
    setUploadingDraft(true);
    setError(null);
    try {
      const url = await uploadImage(file, "banners");
      setDraft({ ...draft, imageUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingDraft(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.imageUrl || !draft.title.trim()) {
      setError("Imagem e título são obrigatórios.");
      return;
    }
    setSavingDraft(true);
    setError(null);
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: draft.imageUrl,
        title: draft.title,
        subtitle: draft.subtitle,
        ctaLabel: draft.ctaLabel,
        href: draft.href,
        sortOrder: draft.sortOrder,
      }),
    });
    const data = await res.json();
    setSavingDraft(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao salvar.");
      return;
    }
    setBanners((prev) => [
      ...prev,
      {
        id: data.id,
        imageUrl: data.image_url,
        title: data.title,
        subtitle: data.subtitle ?? "",
        ctaLabel: data.cta_label,
        href: data.href,
        sortOrder: data.sort_order,
        active: data.active,
      },
    ]);
    setDraft(null);
    router.refresh();
  }

  async function toggleActive(banner: AdminBanner) {
    setBusyId(banner.id);
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !banner.active }),
    });
    setBusyId(null);
    if (res.ok) {
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b)));
      router.refresh();
    }
  }

  async function remove(banner: AdminBanner) {
    if (!confirm(`Excluir o banner "${banner.title}"?`)) return;
    setBusyId(banner.id);
    const res = await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) {
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      router.refresh();
    }
  }

  return (
    <section className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-verde-escuro">Banners do carrossel</h2>
          <p className="mt-1 text-xs text-verde-escuro/55">
            Aparecem na home, abaixo dos produtos em destaque. Sem nenhum cadastrado, o site usa o carrossel padrão.
          </p>
        </div>
        {!draft && (
          <button
            type="button"
            onClick={startNew}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo"
          >
            <Plus size={15} /> Adicionar banner
          </button>
        )}
      </div>

      {draft && (
        <div className="mt-4 grid gap-4 rounded-xl border border-verde-musgo/30 bg-verde-musgo/5 p-4 sm:grid-cols-[160px_1fr]">
          <div className="relative h-28 w-full overflow-hidden rounded-xl border border-verde-claro/30 bg-areia">
            {draft.imageUrl ? (
              <Image src={draft.imageUrl} alt="" fill sizes="160px" className="object-cover" />
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingDraft}
                className="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold text-verde-escuro/50"
              >
                {uploadingDraft ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Enviar foto
              </button>
            )}
            {draft.imageUrl && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-verde-escuro/0 text-xs font-semibold text-areia opacity-0 transition-opacity hover:bg-verde-escuro/60 hover:opacity-100"
              >
                Trocar
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDraftFile(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Título"
              className="rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo sm:col-span-2"
            />
            <input
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              placeholder="Subtítulo"
              className="rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo sm:col-span-2"
            />
            <input
              value={draft.ctaLabel}
              onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
              placeholder="Texto do botão"
              className="rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
            <input
              value={draft.href}
              onChange={(e) => setDraft({ ...draft, href: e.target.value })}
              placeholder="/categorias/suculentas"
              className="rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={saveDraft}
                disabled={savingDraft}
                className="flex items-center gap-1.5 rounded-full bg-verde-escuro px-4 py-2 text-xs font-semibold text-areia hover:bg-verde-musgo disabled:opacity-50"
              >
                {savingDraft ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="text-xs font-medium text-verde-escuro/50 hover:text-verde-escuro"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-terracota">{error}</p>}

      <ul className="mt-4 divide-y divide-verde-claro/15">
        {banners.map((banner) => (
          <li key={banner.id} className="flex items-center gap-3 py-3">
            <GripVertical size={14} className="shrink-0 text-verde-escuro/25" />
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-areia">
              <Image src={banner.imageUrl} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${banner.active ? "text-verde-escuro" : "text-verde-escuro/40 line-through"}`}>
                {banner.title}
              </p>
              <p className="truncate text-xs text-verde-escuro/50">{banner.subtitle || banner.href}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(banner)}
              disabled={busyId === banner.id}
              title={banner.active ? "Desativar" : "Ativar"}
              className="shrink-0 rounded-full p-1.5 text-verde-escuro/50 hover:bg-verde-claro/15 hover:text-verde-escuro disabled:opacity-50"
            >
              {banner.active ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              type="button"
              onClick={() => remove(banner)}
              disabled={busyId === banner.id}
              title="Excluir"
              className="shrink-0 rounded-full p-1.5 text-verde-escuro/50 hover:bg-terracota/10 hover:text-terracota disabled:opacity-50"
            >
              {busyId === banner.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </li>
        ))}
        {banners.length === 0 && !draft && (
          <li className="py-6 text-center text-sm text-verde-escuro/50">Nenhum banner personalizado — o site está usando o carrossel padrão.</li>
        )}
      </ul>
    </section>
  );
}
