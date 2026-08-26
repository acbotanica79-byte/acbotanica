"use client";

import { useState } from "react";
import { Loader2, Mail, ShieldCheck, UserPlus } from "lucide-react";

interface AdminMember {
  id: string;
  email: string;
  created_at: string;
}

export default function TeamClient({ initialTeam }: { initialTeam: AdminMember[] }) {
  const [team, setTeam] = useState(initialTeam);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Erro ao enviar convite." });
      return;
    }

    setMessage({ type: "success", text: `Convite enviado para ${data.email}.` });
    setEmail("");

    const listRes = await fetch("/api/admin/team");
    if (listRes.ok) {
      const listData = await listRes.json();
      setTeam(listData.team ?? []);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-verde-escuro">Convidar novo admin</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5">
            <Mail size={16} className="text-verde-escuro/50 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              disabled={loading}
              className="w-full bg-transparent text-sm outline-none placeholder:text-verde-escuro/40 disabled:opacity-50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-verde-escuro px-5 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          Enviar convite
        </button>
      </form>

      {message && (
        <div
          className={`rounded-xl p-3.5 text-sm font-medium ${
            message.type === "error"
              ? "bg-terracota/10 text-terracota border border-terracota/20"
              : "bg-verde-claro/30 text-verde-escuro border border-verde-claro/50"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-verde-escuro">Admins atuais</h2>
        <div className="mt-3 divide-y divide-verde-claro/15 rounded-2xl border border-verde-claro/30 bg-branco">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-claro/20 text-verde-escuro">
                  <ShieldCheck size={15} />
                </span>
                <span className="text-sm font-medium text-verde-escuro">{member.email}</span>
              </div>
              <span className="text-xs text-verde-escuro/50">
                desde {new Date(member.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
