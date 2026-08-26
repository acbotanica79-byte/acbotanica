"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Save, Trash2, Percent, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  minOrderValue: number;
  usageLimit: number | null;
  timesUsed: number;
  expiresAt: string | null;
}

type Draft = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minOrderValue: string;
  usageLimit: string;
  expiresAt: string;
};

const EMPTY_DRAFT: Draft = { code: "", discountType: "percent", discountValue: "", minOrderValue: "", usageLimit: "", expiresAt: "" };

export default function CuponsClient({ initialCoupons }: { initialCoupons: AdminCoupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!draft.code.trim() || !draft.discountValue) {
      setError("Código e valor do desconto são obrigatórios.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: draft.code,
        discountType: draft.discountType,
        discountValue: Number(draft.discountValue),
        minOrderValue: draft.minOrderValue ? Number(draft.minOrderValue) : 0,
        usageLimit: draft.usageLimit,
        expiresAt: draft.expiresAt || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao criar cupom.");
      return;
    }
    setCoupons((prev) => [
      {
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: Number(data.discount_value),
        active: data.active,
        minOrderValue: Number(data.min_order_value),
        usageLimit: data.usage_limit,
        timesUsed: data.times_used,
        expiresAt: data.expires_at,
      },
      ...prev,
    ]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    router.refresh();
  }

  async function toggleActive(coupon: AdminCoupon) {
    setBusyId(coupon.id);
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    setBusyId(null);
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
      router.refresh();
    }
  }

  async function remove(coupon: AdminCoupon) {
    if (!confirm(`Excluir o cupom "${coupon.code}"?`)) return;
    setBusyId(coupon.id);
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-verde-escuro/60">{coupons.length} cupom(ns) cadastrado(s)</p>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-full bg-verde-escuro px-4 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo"
          >
            <Plus size={15} /> Novo cupom
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-verde-musgo/30 bg-verde-musgo/5 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Código</label>
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="BEMVINDO10"
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm font-mono uppercase outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Tipo</label>
            <select
              value={draft.discountType}
              onChange={(e) => setDraft({ ...draft, discountType: e.target.value as "percent" | "fixed" })}
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            >
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">
              Valor do desconto {draft.discountType === "percent" ? "(%)" : "(R$)"}
            </label>
            <input
              value={draft.discountValue}
              onChange={(e) => setDraft({ ...draft, discountValue: e.target.value })}
              type="number"
              min="0"
              step="0.01"
              placeholder={draft.discountType === "percent" ? "10" : "20"}
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Pedido mínimo (R$, opcional)</label>
            <input
              value={draft.minOrderValue}
              onChange={(e) => setDraft({ ...draft, minOrderValue: e.target.value })}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Limite de usos (opcional)</label>
            <input
              value={draft.usageLimit}
              onChange={(e) => setDraft({ ...draft, usageLimit: e.target.value })}
              type="number"
              min="1"
              placeholder="Sem limite"
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-verde-escuro/70">Expira em (opcional)</label>
            <input
              value={draft.expiresAt}
              onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })}
              type="date"
              className="w-full rounded-xl border border-verde-claro/50 bg-branco px-3 py-2 text-sm outline-none focus:border-verde-musgo"
            />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-verde-escuro px-4 py-2 text-xs font-semibold text-areia hover:bg-verde-musgo disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Criar cupom
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setDraft(EMPTY_DRAFT);
                setError(null);
              }}
              className="text-xs font-medium text-verde-escuro/50 hover:text-verde-escuro"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-terracota">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-verde-claro/30 bg-branco">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-verde-claro/20 text-left text-xs uppercase tracking-wide text-verde-escuro/50">
              <th className="p-4">Código</th>
              <th className="p-4">Desconto</th>
              <th className="p-4">Pedido mínimo</th>
              <th className="p-4">Usos</th>
              <th className="p-4">Expira</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-verde-claro/10 last:border-0">
                <td className="p-4 font-mono font-semibold text-verde-escuro">{c.code}</td>
                <td className="p-4 text-verde-escuro/80">
                  <span className="inline-flex items-center gap-1">
                    {c.discountType === "percent" ? <Percent size={12} /> : <DollarSign size={12} />}
                    {c.discountType === "percent" ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                  </span>
                </td>
                <td className="p-4 text-verde-escuro/70">{c.minOrderValue > 0 ? formatPrice(c.minOrderValue) : "—"}</td>
                <td className="p-4 text-verde-escuro/70">
                  {c.timesUsed}
                  {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="p-4 text-verde-escuro/70">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    disabled={busyId === c.id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      c.active ? "bg-verde-musgo/15 text-verde-musgo hover:bg-verde-musgo/25" : "bg-verde-escuro/10 text-verde-escuro/50 hover:bg-verde-escuro/15"
                    }`}
                  >
                    {c.active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    disabled={busyId === c.id}
                    className="rounded-full p-1.5 text-verde-escuro/50 hover:bg-terracota/10 hover:text-terracota disabled:opacity-50"
                  >
                    {busyId === c.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && !creating && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-verde-escuro/50">
                  Nenhum cupom cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
