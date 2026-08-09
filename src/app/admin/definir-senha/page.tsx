"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DefinirSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível salvar a senha. O link pode ter expirado — peça um novo convite.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-verde-claro/30 bg-branco/95 p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
          <KeyRound size={20} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro">Definir senha</h1>
        <p className="mt-1 text-sm text-verde-escuro/60">
          Escolha a senha de acesso ao painel administrativo.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-verde-escuro">Nova senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-verde-escuro">Confirmar senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-terracota">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Salvar e entrar"}
        </button>
      </form>
    </div>
  );
}
