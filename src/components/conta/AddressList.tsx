"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X } from "lucide-react";

export type Address = {
  id: string;
  label: string;
  recipient_name: string;
  cep: string;
  address: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  uf: string;
  is_default: boolean;
};

type FormState = {
  label: string;
  recipientName: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  uf: string;
  isDefault: boolean;
};

const EMPTY_FORM: FormState = {
  label: "Principal",
  recipientName: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  uf: "",
  isDefault: false,
};

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function AddressList({ initialData }: { initialData: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [cepLoading, setCepLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label,
      recipientName: a.recipient_name,
      cep: maskCep(a.cep),
      address: a.address,
      number: a.number ?? "",
      complement: a.complement ?? "",
      neighborhood: a.neighborhood ?? "",
      city: a.city,
      uf: a.uf,
      isDefault: a.is_default,
    });
    setEditingId(a.id);
    setError(null);
    setShowForm(true);
  }

  async function handleCepBlur() {
    const clean = form.cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: clean, subtotal: 0 }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({
          ...f,
          address: data.logradouro || f.address,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          uf: data.uf || f.uf,
        }));
      }
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      label: form.label,
      recipientName: form.recipientName,
      cep: form.cep,
      address: form.address,
      number: form.number,
      complement: form.complement,
      neighborhood: form.neighborhood,
      city: form.city,
      uf: form.uf,
      isDefault: form.isDefault,
    };

    const res = await fetch(editingId ? `/api/conta/addresses/${editingId}` : "/api/conta/addresses", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao salvar endereço.");
      return;
    }

    const saved: Address = data.address;
    setAddresses((prev) => {
      const withoutOld = prev.filter((a) => a.id !== saved.id);
      const cleared = saved.is_default ? withoutOld.map((a) => ({ ...a, is_default: false })) : withoutOld;
      return [saved, ...cleared];
    });
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este endereço?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/conta/addresses/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/conta/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-verde-escuro">Meus Endereços</h2>
          <p className="mt-1 text-sm text-verde-escuro/60">Salve endereços para agilizar seus próximos pedidos.</p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex shrink-0 items-center gap-2 rounded-full bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo transition-colors"
          >
            <Plus size={16} /> Adicionar
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-verde-claro/30 bg-areia/20 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-verde-escuro">{editingId ? "Editar endereço" : "Novo endereço"}</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-verde-escuro/50 hover:text-verde-escuro">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Apelido</label>
              <input
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Casa, Trabalho..."
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Nome do destinatário</label>
              <input
                required
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">CEP</label>
              <div className="relative">
                <input
                  required
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: maskCep(e.target.value) })}
                  onBlur={handleCepBlur}
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
                />
                {cepLoading && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-verde-escuro/40" />}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Endereço</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Número</label>
              <input
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Complemento</label>
              <input
                value={form.complement}
                onChange={(e) => setForm({ ...form, complement: e.target.value })}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Bairro</label>
              <input
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Cidade</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">UF</label>
              <input
                required
                value={form.uf}
                onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase().slice(0, 2) })}
                maxLength={2}
                className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-verde-escuro/80">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-verde-claro/50"
            />
            Definir como endereço padrão
          </label>

          {error && <p className="text-sm text-terracota">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Salvar endereço
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-verde-claro/50 py-14 text-center text-verde-escuro/60">
          <MapPin size={28} strokeWidth={1.5} />
          <p className="text-sm">Você ainda não salvou nenhum endereço.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-verde-claro/30 bg-branco p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-verde-escuro">{a.label}</span>
                  {a.is_default && (
                    <span className="flex items-center gap-1 rounded-full bg-verde-claro/20 px-2 py-0.5 text-[11px] font-semibold text-verde-musgo">
                      <Star size={10} fill="currentColor" /> Padrão
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(a)} className="rounded-full p-1.5 text-verde-escuro/50 hover:bg-verde-claro/15 hover:text-verde-escuro" aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="rounded-full p-1.5 text-verde-escuro/50 hover:bg-terracota/10 hover:text-terracota"
                    aria-label="Excluir"
                  >
                    {deletingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-verde-escuro/80">{a.recipient_name}</p>
              <p className="mt-1 text-sm text-verde-escuro/60">
                {a.address}, {a.number || "s/n"}
                {a.complement ? ` - ${a.complement}` : ""}
                {a.neighborhood ? ` - ${a.neighborhood}` : ""}
              </p>
              <p className="text-sm text-verde-escuro/60">
                {a.city}/{a.uf} · {maskCep(a.cep)}
              </p>
              {!a.is_default && (
                <button
                  onClick={() => handleSetDefault(a.id)}
                  className="mt-3 text-xs font-medium text-verde-musgo hover:underline"
                >
                  Definir como padrão
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
