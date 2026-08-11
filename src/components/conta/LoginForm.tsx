"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/constants";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.2c0-.8-.07-1.5-.2-2.2H12v4.3h5.9c-.25 1.3-1 2.5-2.1 3.2v2.7h3.4c2-1.8 3.2-4.5 3.2-8z" />
      <path fill="#34A853" d="M12 23c2.8 0 5.2-.9 6.9-2.5l-3.4-2.7c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 20.5 7.9 23 12 23z" />
      <path fill="#FBBC05" d="M6.2 14.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.8H2.7C2 9.1 1.5 10.5 1.5 12.5s.5 3.4 1.2 4.7l3.5-2.7z" />
      <path fill="#EA4335" d="M12 6.2c1.5 0 2.9.5 4 1.5l3-3C17.2 2.9 14.8 2 12 2 7.9 2 4.4 4.5 2.7 7.8l3.5 2.7c.8-2.5 3.1-4.3 5.8-4.3z" />
    </svg>
  );
}

export default function LoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${SITE_URL}/auth/callback?next=/conta/painel`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: "Erro ao conectar com Google. Tente novamente." });
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoadingEmail(true);
    setMessage(null);
    
    // Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback?next=/conta/painel`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Enviamos um link mágico para o seu e-mail! Verifique sua caixa de entrada." });
      setEmail("");
    }
    
    setIsLoadingEmail(false);
  };

  return (
    <div className="w-full rounded-3xl border border-verde-claro/30 bg-branco/95 p-8 sm:p-10 shadow-[0_4px_24px_rgba(27,67,50,0.04)]">
      <h1 className="text-center font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
        Minha Conta
      </h1>
      <p className="mt-2 text-center text-sm text-verde-escuro/65">
        Entre para acompanhar pedidos, favoritos e receber recomendações personalizadas.
      </p>

      {message && (
        <div className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center justify-center text-center ${
          message.type === "error" ? "bg-terracota/10 text-terracota border border-terracota/20" : "bg-verde-claro/30 text-verde-escuro border border-verde-claro/50"
        }`}>
          {message.text}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle || isLoadingEmail}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-verde-claro/50 py-3 text-sm font-medium text-verde-escuro transition-colors hover:bg-verde-claro/10 disabled:opacity-50"
        >
          {isLoadingGoogle ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
          Continuar com Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-verde-escuro/40">
        <span className="h-px flex-1 bg-verde-claro/30" />
        ou
        <span className="h-px flex-1 bg-verde-claro/30" />
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-full border border-verde-claro/50 px-4 py-3 bg-areia/30">
          <Mail size={16} className="text-verde-escuro/50 shrink-0" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            disabled={isLoadingEmail || isLoadingGoogle}
            className="w-full bg-transparent text-sm outline-none placeholder:text-verde-escuro/40 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoadingEmail || isLoadingGoogle || !email}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-70"
        >
          {isLoadingEmail ? <Loader2 size={16} className="animate-spin" /> : null}
          Receber link de acesso
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-verde-escuro/45 leading-relaxed">
        Ao continuar, você concorda com nossos{" "}
        <a href="/termos" className="underline hover:text-verde-escuro">Termos de Uso</a> e{" "}
        <a href="/privacidade" className="underline hover:text-verde-escuro">Política de Privacidade</a>.
      </p>
    </div>
  );
}
