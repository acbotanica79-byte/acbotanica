"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/PasswordField";
import Turnstile from "@/components/Turnstile";

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

type Mode = "login" | "cadastro" | "esqueci";

export default function LoginForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const needsCaptcha = Boolean(turnstileSiteKey);

  async function verifyCaptchaIfNeeded(): Promise<boolean> {
    if (!needsCaptcha) return true;
    if (!captchaToken) {
      setMessage({ type: "error", text: "Confirme que você não é um robô." });
      return false;
    }
    const res = await fetch("/api/auth/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken }),
    });
    const data = await res.json();
    if (!data.success) {
      setMessage({ type: "error", text: "Não foi possível confirmar o CAPTCHA. Tente novamente." });
      return false;
    }
    return true;
  }

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/conta/painel`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: "Erro ao conectar com Google. Tente novamente." });
      setIsLoadingGoogle(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoadingEmail(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({
        type: "error",
        text: "E-mail ou senha inválidos. Se ainda não tem conta, crie uma abaixo.",
      });
      setIsLoadingEmail(false);
      return;
    }
    // Navegação completa (não router.push): garante que o servidor já veja os cookies de sessão
    // recém-criados. /conta decide, no servidor, se quem logou é admin (vai pro /admin) ou
    // cliente comum (vai pro /conta/painel).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/conta";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage({ type: "error", text: "A senha precisa ter pelo menos 8 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    if (!lgpdConsent) {
      setMessage({ type: "error", text: "Você precisa concordar com a Política de Privacidade para criar a conta." });
      return;
    }

    setIsLoadingEmail(true);
    const captchaOk = await verifyCaptchaIfNeeded();
    if (!captchaOk) {
      setIsLoadingEmail(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/conta/painel`,
      },
    });

    setIsLoadingEmail(false);

    if (error) {
      setMessage({
        type: "error",
        text: error.message.includes("already registered")
          ? "Esse e-mail já tem uma conta. Faça login."
          : "Não foi possível criar a conta. Tente novamente.",
      });
      return;
    }

    if (data.session) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/conta";
      return;
    }
    setMessage({
      type: "success",
      text: "Quase lá! Enviamos um e-mail de confirmação — clique no link pra ativar sua conta.",
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoadingEmail(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/conta/painel`,
    });
    setIsLoadingEmail(false);

    if (error) {
      setMessage({ type: "error", text: "Não foi possível enviar o e-mail. Tente novamente." });
      return;
    }
    setMessage({ type: "success", text: "Se esse e-mail tiver uma conta, chegou um link pra redefinir a senha." });
  };

  const titles: Record<Mode, string> = {
    login: "Minha Conta",
    cadastro: "Criar conta",
    esqueci: "Esqueci minha senha",
  };
  const subtitles: Record<Mode, string> = {
    login: "Entre para acompanhar pedidos, favoritos e receber recomendações personalizadas.",
    cadastro: "Crie sua conta para comprar, acompanhar pedidos e favoritar plantas.",
    esqueci: "Informe seu e-mail para receber o link de redefinição de senha.",
  };

  return (
    <div className="w-full rounded-3xl border border-verde-claro/30 bg-branco/95 p-8 sm:p-10 shadow-[0_4px_24px_rgba(27,67,50,0.04)]">
      <h1 className="text-center font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
        {titles[mode]}
      </h1>
      <p className="mt-2 text-center text-sm text-verde-escuro/65">{subtitles[mode]}</p>

      {message && (
        <div
          className={`mt-6 flex items-center justify-center rounded-xl p-4 text-center text-sm font-medium ${
            message.type === "error"
              ? "border border-terracota/20 bg-terracota/10 text-terracota"
              : "border border-verde-claro/50 bg-verde-claro/30 text-verde-escuro"
          }`}
        >
          {message.text}
        </div>
      )}

      {mode !== "esqueci" && (
        <>
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
        </>
      )}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full border border-verde-claro/50 px-4 py-3 bg-areia/30">
            <Mail size={16} className="text-verde-escuro/50 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoadingEmail}
              className="w-full bg-transparent text-sm outline-none placeholder:text-verde-escuro/40 disabled:opacity-50"
            />
          </div>
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder="Sua senha"
            autoComplete="current-password"
            disabled={isLoadingEmail}
          />
          <button
            type="button"
            onClick={() => setMode("esqueci")}
            className="self-end text-xs font-medium text-verde-musgo hover:text-verde-escuro"
          >
            Esqueci minha senha
          </button>
          <button
            type="submit"
            disabled={isLoadingEmail || isLoadingGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-70"
          >
            {isLoadingEmail ? <Loader2 size={16} className="animate-spin" /> : null}
            Entrar
          </button>
          <p className="mt-1 text-center text-sm text-verde-escuro/60">
            Ainda não tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("cadastro")}
              className="font-semibold text-verde-musgo hover:text-verde-escuro"
            >
              Criar conta
            </button>
          </p>
        </form>
      )}

      {mode === "cadastro" && (
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full border border-verde-claro/50 px-4 py-3 bg-areia/30">
            <Mail size={16} className="text-verde-escuro/50 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoadingEmail}
              className="w-full bg-transparent text-sm outline-none placeholder:text-verde-escuro/40 disabled:opacity-50"
            />
          </div>
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder="Crie uma senha (mín. 8 caracteres)"
            autoComplete="new-password"
            minLength={8}
            disabled={isLoadingEmail}
          />
          <PasswordField
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirme a senha"
            autoComplete="new-password"
            minLength={8}
            disabled={isLoadingEmail}
          />

          <label className="mt-1 flex items-start gap-2 text-xs text-verde-escuro/70">
            <input
              type="checkbox"
              checked={lgpdConsent}
              onChange={(e) => setLgpdConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-verde-claro/50 text-verde-musgo focus:ring-verde-musgo"
            />
            <span>
              Li e concordo com a{" "}
              <a href="/privacidade" target="_blank" className="underline hover:text-verde-escuro">
                Política de Privacidade
              </a>{" "}
              e os{" "}
              <a href="/termos" target="_blank" className="underline hover:text-verde-escuro">
                Termos de Uso
              </a>
              , conforme a LGPD.
            </span>
          </label>

          {needsCaptcha && (
            <div className="mt-1">
              <Turnstile siteKey={turnstileSiteKey!} onVerify={setCaptchaToken} />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoadingEmail || isLoadingGoogle}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-70"
          >
            {isLoadingEmail ? <Loader2 size={16} className="animate-spin" /> : null}
            Criar conta
          </button>
          <p className="mt-1 text-center text-sm text-verde-escuro/60">
            Já tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-semibold text-verde-musgo hover:text-verde-escuro"
            >
              Entrar
            </button>
          </p>
        </form>
      )}

      {mode === "esqueci" && (
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full border border-verde-claro/50 px-4 py-3 bg-areia/30">
            <Mail size={16} className="text-verde-escuro/50 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoadingEmail}
              className="w-full bg-transparent text-sm outline-none placeholder:text-verde-escuro/40 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingEmail}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-70"
          >
            {isLoadingEmail ? <Loader2 size={16} className="animate-spin" /> : null}
            Enviar link
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="text-center text-sm font-medium text-verde-escuro/60 hover:text-verde-escuro"
          >
            Voltar para o login
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-verde-escuro/45 leading-relaxed">
        Ao continuar, você concorda com nossos{" "}
        <a href="/termos" className="underline hover:text-verde-escuro">Termos de Uso</a> e{" "}
        <a href="/privacidade" className="underline hover:text-verde-escuro">Política de Privacidade</a>.
      </p>
    </div>
  );
}
