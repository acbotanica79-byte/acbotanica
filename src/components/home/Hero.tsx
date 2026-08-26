"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sprout, Truck } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function Hero({
  imageUrl,
  headline,
  subheadline,
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD,
}: {
  imageUrl?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  freeShippingThreshold?: number;
} = {}) {
  return (
    <section className="relative min-h-[600px] w-full overflow-hidden bg-areia sm:min-h-[700px]">
      <Image
        src={imageUrl || "/davinci_crie_uma_fotografia_comercial_hiper_realista_para_.png"}
        alt="Composição de Monstera, samambaia e suculentas em vasos de cerâmica sobre bancada de madeira"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center sm:object-right"
      />
      {/* Gradiente mais intenso para contraste */}
      <div className="absolute inset-0 bg-gradient-to-r from-areia via-areia/90 to-transparent sm:via-areia/65" />
      {/* Gradiente inferior sutil */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-areia to-transparent" />

      <div className="relative z-10 flex h-full min-h-[600px] flex-col items-start justify-center container-px mx-auto max-w-[1600px] sm:min-h-[700px]">
        {/* Badge frete grátis */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-verde-musgo/25 bg-verde-claro/20 px-4 py-2 text-xs font-semibold text-verde-musgo backdrop-blur-sm"
        >
          <Truck size={13} />
          Frete grátis acima de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(freeShippingThreshold)}
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-verde-musgo"
        >
          <Sprout size={15} />
          Curadoria botânica premium
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
          className="max-w-xl font-display text-5xl font-semibold leading-[1.04] text-verde-escuro text-balance sm:text-7xl"
        >
          {headline ? (
            headline
          ) : (
            <>
              Mais Verde
              <br />
              <span className="italic text-verde-musgo">Começa Aqui</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 max-w-sm text-base leading-relaxed text-verde-escuro/75 sm:text-lg"
        >
          {subheadline || "Plantas, vasos artesanais e acessórios para transformar seu ambiente e sua vida."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/produtos"
            className="group inline-flex items-center gap-2.5 rounded-full bg-verde-escuro px-7 py-3.5 text-sm font-semibold text-branco shadow-lg shadow-verde-escuro/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-verde-escuro/30"
          >
            Explorar catálogo
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/categorias/suculentas"
            className="inline-flex items-center gap-2 rounded-full border-2 border-verde-escuro/20 bg-branco/70 px-6 py-3 text-sm font-semibold text-verde-escuro backdrop-blur-sm transition-all hover:border-verde-musgo hover:bg-branco"
          >
            Ver suculentas
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-10 flex items-center gap-3 text-sm text-verde-escuro/60"
        >
          <div className="flex -space-x-2">
            {["#2d6a4f", "#c77d4a", "#1b4332", "#95d5b2"].map((c, i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-areia" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>+2.000 clientes felizes</span>
        </motion.div>
      </div>
    </section>
  );
}
