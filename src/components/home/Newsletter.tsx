"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível cadastrar agora. Tente novamente.");
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  return (
    <section className="container-px mx-auto max-w-[1600px] py-16 sm:py-24">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative flex min-h-[320px] overflow-hidden rounded-3xl bg-verde-escuro">
          <Image
            src="/download.png"
            alt="Kit presente com suculenta, vaso artesanal e acessórios de jardinagem"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-verde-escuro via-verde-escuro/85 to-transparent sm:via-verde-escuro/50" />
          <div className="relative z-10 flex max-w-sm flex-col justify-center p-8 sm:p-12">
            <h3 className="font-display text-3xl font-semibold text-branco sm:text-4xl">
              Kits Especiais
              <br />
              Perfeitos para presentear
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-areia/85 sm:text-base">
              Kits completos com plantas, vasos e acessórios para surpreender
              quem você ama.
            </p>
            <Link
              href="/categorias/presentes-kits"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-dourado px-6 py-3 text-sm font-semibold text-verde-escuro transition-transform hover:scale-[1.03]"
            >
              Ver kits
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="relative flex flex-col justify-center rounded-3xl border border-verde-claro/30 bg-branco px-8 py-12 text-center sm:px-10">
          <h3 className="font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
            Receba novidades e ofertas
          </h3>
          <p className="mx-auto mt-3 max-w-xs text-sm text-verde-escuro/70">
            Cadastre-se e ganhe 10% OFF na sua primeira compra!
          </p>

          {status === "done" ? (
            <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2 rounded-full bg-verde-musgo/10 px-5 py-3 text-sm font-semibold text-verde-musgo">
              <Check size={16} /> Cadastrado! Fique de olho no seu e-mail.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="w-full rounded-full border border-verde-claro/50 bg-branco px-5 py-3 text-sm text-verde-escuro outline-none placeholder:text-verde-escuro/40 focus:border-verde-musgo"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full bg-verde-escuro px-6 py-3 text-sm font-semibold text-branco transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                {status === "loading" ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Cadastrar"}
              </button>
              {error && <p className="text-xs text-terracota">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
