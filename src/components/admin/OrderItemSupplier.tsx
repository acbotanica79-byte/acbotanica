"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function OrderItemSupplier({
  orderId,
  itemId,
  initialSupplierName,
  initialSupplierCost,
  initialSupplierUf,
  initialSupplierCep,
  initialSupplierInternational,
}: {
  orderId: string;
  itemId: string;
  initialSupplierName: string | null;
  initialSupplierCost: number | null;
  initialSupplierUf: string | null;
  initialSupplierCep: string | null;
  initialSupplierInternational: boolean;
}) {
  const [supplierName, setSupplierName] = useState(initialSupplierName ?? "");
  const [supplierCost, setSupplierCost] = useState(initialSupplierCost?.toString() ?? "");
  const [supplierUf, setSupplierUf] = useState(initialSupplierUf ?? "");
  const [supplierCep, setSupplierCep] = useState(initialSupplierCep ?? "");
  const [international, setInternational] = useState(initialSupplierInternational);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/orders/${orderId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId,
        supplierName,
        supplierCost,
        supplierUf: international ? null : supplierUf || null,
        supplierCep: international ? null : supplierCep || null,
        supplierInternational: international,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="Onde comprou (fornecedor)"
          className="w-48 rounded-lg border border-verde-claro/40 bg-branco px-3 py-1.5 text-xs outline-none focus:border-verde-musgo"
        />
        <input
          value={supplierCost}
          onChange={(e) => setSupplierCost(e.target.value)}
          placeholder="Custo R$"
          type="number"
          step="0.01"
          className="w-24 rounded-lg border border-verde-claro/40 bg-branco px-3 py-1.5 text-xs outline-none focus:border-verde-musgo"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-verde-escuro px-3 py-1.5 text-xs font-semibold text-areia hover:bg-verde-musgo disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : "Salvar"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-verde-escuro/60">
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={international} onChange={(e) => setInternational(e.target.checked)} />
          Fornecedor internacional
        </label>
        {!international && (
          <>
            <select
              value={supplierUf}
              onChange={(e) => setSupplierUf(e.target.value)}
              className="rounded-lg border border-verde-claro/40 bg-branco px-2 py-1.5 text-xs outline-none focus:border-verde-musgo"
            >
              <option value="">UF do fornecedor</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            <input
              value={supplierCep}
              onChange={(e) => setSupplierCep(e.target.value)}
              placeholder="CEP do fornecedor (opcional, mais preciso)"
              className="w-56 rounded-lg border border-verde-claro/40 bg-branco px-2 py-1.5 text-xs outline-none focus:border-verde-musgo"
            />
          </>
        )}
      </div>
    </div>
  );
}
