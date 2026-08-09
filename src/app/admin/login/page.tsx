"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-3xl border border-verde-claro/30 bg-branco/95 p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
        <Lock size={20} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro">Painel administrativo</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">Acesso restrito.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-verde-escuro">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-verde-escuro">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        {loading ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Entrar"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
