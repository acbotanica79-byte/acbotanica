"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/constants";

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/admin/definir-senha`,
    });
    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-verde-claro/30 bg-branco/95 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
          <Lock size={20} />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold text-verde-escuro">E-mail enviado</h1>
        <p className="mt-2 text-sm text-verde-escuro/60">
          Se {email} tiver uma conta de admin, chegou um link pra redefinir a senha. Verifique também o spam.
        </p>
        <button
          onClick={onBack}
          className="mt-6 text-sm font-semibold text-verde-musgo hover:text-verde-escuro"
        >
          Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-3xl border border-verde-claro/30 bg-branco/95 p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
        <Lock size={20} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro">Esqueci minha senha</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">Informe seu e-mail de admin para receber o link de redefinição.</p>

      <div className="mt-6">
        <label className="text-sm font-medium text-verde-escuro">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
        />
      </div>

      {error && <p className="mt-4 text-sm text-terracota">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Enviar link"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full text-sm font-medium text-verde-escuro/60 hover:text-verde-escuro"
      >
        Voltar para o login
      </button>
    </form>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
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

  if (forgotMode) {
    return <ForgotPasswordForm onBack={() => setForgotMode(false)} />;
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-verde-escuro">Senha</label>
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="text-xs font-medium text-verde-musgo hover:text-verde-escuro"
            >
              Esqueci minha senha
            </button>
          </div>
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
