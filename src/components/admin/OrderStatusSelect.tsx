"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "novo", label: "Novo" },
  { value: "comprado", label: "Comprado do fornecedor" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: string) {
    setValue(newStatus);
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-full border border-verde-claro/50 bg-branco px-4 py-2 text-sm font-semibold text-verde-escuro outline-none focus:border-verde-musgo"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {saving && <Loader2 size={15} className="animate-spin text-verde-escuro/50" />}
    </div>
  );
}
