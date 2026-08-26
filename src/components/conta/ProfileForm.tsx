"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type ProfileData = {
  id: string;
  full_name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
};

export default function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const supabase = createClient();
  const router = useRouter();
  const [data, setData] = useState<ProfileData>(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // CPF formatter: 000.000.000-00
  const formatCPF = (val: string) => {
    let v = val.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{3})/, "$1.$2");
    return v;
  };

  // Phone formatter: (00) 00000-0000
  const formatPhone = (val: string) => {
    let v = val.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    return v;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/conta/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: data.full_name, cpf: data.cpf, phone: data.phone }),
    });

    if (!res.ok) {
      setMessage({ type: "error", text: "Erro ao salvar dados. Tente novamente." });
    } else {
      setMessage({ type: "success", text: "Dados atualizados com sucesso!" });
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "LGPD: Tem certeza de que deseja excluir permanentemente sua conta e todos os dados pessoais associados? Esta ação não pode ser desfeita."
    );
    if (!confirm) return;

    // A exclusão real do auth.users exige RPC ou Edge Function via admin.
    // Para efeito desta implementação, anonimizamos os dados do profile via API (service role).
    setLoading(true);
    const res = await fetch("/api/conta/delete", { method: "POST" });

    if (res.ok) {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } else {
      setMessage({ type: "error", text: "Erro ao processar a exclusão. Contate o suporte." });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display text-xl font-semibold text-verde-escuro">Meus Dados</h2>
        <p className="mt-1 text-sm text-verde-escuro/60">
          Atualize suas informações pessoais para agilizar suas próximas compras.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === "error" ? "bg-terracota/10 text-terracota" : "bg-verde-claro/30 text-verde-escuro"
        }`}>
          <CheckCircle2 size={16} />
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Nome Completo</label>
          <input
            required
            value={data.full_name || ""}
            onChange={(e) => setData({ ...data, full_name: e.target.value })}
            className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">E-mail (Leitura apenas)</label>
          <input
            disabled
            value={data.email || ""}
            className="w-full rounded-xl border border-verde-claro/30 bg-areia/50 px-4 py-2.5 text-sm text-verde-escuro/50 outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">CPF</label>
          <input
            value={data.cpf || ""}
            onChange={(e) => setData({ ...data, cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-verde-escuro/70">Telefone / WhatsApp</label>
          <input
            value={data.phone || ""}
            onChange={(e) => setData({ ...data, phone: formatPhone(e.target.value) })}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            maxLength={15}
            className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>

        <div className="sm:col-span-2 pt-4 border-t border-verde-claro/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="text-xs font-medium text-terracota hover:underline flex items-center gap-1.5"
          >
            <ShieldAlert size={14} />
            Solicitar exclusão de dados (LGPD)
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex w-full sm:w-auto min-w-[140px] items-center justify-center gap-2 rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
