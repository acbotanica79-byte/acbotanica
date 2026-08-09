"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function OrderItemSupplier({
  orderId,
  itemId,
  initialSupplierName,
  initialSupplierCost,
}: {
  orderId: string;
  itemId: string;
  initialSupplierName: string | null;
  initialSupplierCost: number | null;
}) {
  const [supplierName, setSupplierName] = useState(initialSupplierName ?? "");
  const [supplierCost, setSupplierCost] = useState(initialSupplierCost?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/orders/${orderId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, supplierName, supplierCost }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
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
  );
}
