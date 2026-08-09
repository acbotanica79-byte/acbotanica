import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Minha Conta",
  description: "Entre ou crie sua conta ACCFG Botânica.",
  robots: { index: false, follow: true },
};

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

export default function ContaPage() {
  return (
    <div className="container-px mx-auto flex max-w-[480px] flex-col items-center py-16 sm:py-24">
      <div className="w-full rounded-3xl border border-verde-claro/30 bg-branco/95 p-8 sm:p-10">
        <h1 className="text-center font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
          Minha Conta
        </h1>
        <p className="mt-2 text-center text-sm text-verde-escuro/65">
          Entre para acompanhar pedidos, favoritos e receber recomendações personalizadas.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button className="flex items-center justify-center gap-3 rounded-full border border-verde-claro/50 py-3 text-sm font-medium text-verde-escuro transition-colors hover:bg-verde-claro/10">
            <GoogleIcon /> Continuar com Google
          </button>
          <button className="flex items-center justify-center gap-3 rounded-full border border-verde-claro/50 py-3 text-sm font-medium text-verde-escuro transition-colors hover:bg-verde-claro/10">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1877F2] text-[11px] font-bold text-white">f</span>
            Continuar com Facebook
          </button>
          <button className="flex items-center justify-center gap-3 rounded-full border border-verde-claro/50 py-3 text-sm font-medium text-verde-escuro transition-colors hover:bg-verde-claro/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.49 2.87 8.3 6.84 9.64.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.93.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.02 10.02 0 0 0 22 12.19C22 6.58 17.52 2 12 2z" />
            </svg>
            Continuar com GitHub
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-verde-escuro/40">
          <span className="h-px flex-1 bg-verde-claro/30" />
          ou
          <span className="h-px flex-1 bg-verde-claro/30" />
        </div>

        <form className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full border border-verde-claro/50 px-4 py-3">
            <Mail size={16} className="text-verde-escuro/50" />
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-verde-escuro/40"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-verde-escuro py-3 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo"
          >
            Continuar com e-mail
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-verde-escuro/45">
          Ao continuar, você concorda com nossos{" "}
          <a href="/termos" className="underline">Termos de Uso</a> e{" "}
          <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}
