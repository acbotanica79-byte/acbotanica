"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function ContatoForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-verde-claro/30 bg-branco/90 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-musgo/10 text-verde-musgo">
          <Check size={22} />
        </span>
        <p className="font-display text-xl font-semibold text-verde-escuro">Mensagem enviada!</p>
        <p className="text-sm text-verde-escuro/60">
          Nossa equipe responde em até 1 dia útil.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-verde-claro/30 bg-branco/90 p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-verde-escuro">Nome</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">E-mail</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-verde-escuro">Assunto</label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-verde-escuro">Mensagem</label>
        <textarea
          rows={5}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-verde-escuro px-7 py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-50"
      >
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Enviar mensagem"}
      </button>
      {status === "error" && (
        <p className="text-sm text-terracota">Não foi possível enviar agora. Tente novamente.</p>
      )}
    </form>
  );
}
