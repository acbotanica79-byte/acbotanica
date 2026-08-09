"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sprout } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[560px] w-full overflow-hidden bg-areia sm:min-h-[640px]">
      <Image
        src="/davinci_crie_uma_fotografia_comercial_hiper_realista_para_.png"
        alt="Composição de Monstera, samambaia e suculentas em vasos de cerâmica sobre bancada de madeira"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-areia via-areia/85 to-transparent sm:via-areia/60" />

      <div className="relative z-10 flex h-full min-h-[560px] flex-col items-start justify-center container-px mx-auto max-w-[1600px] sm:min-h-[640px]">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-verde-musgo"
        >
          <Sprout size={16} />
          Seu espaço
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-xl font-display text-4xl font-semibold leading-[1.08] text-verde-escuro text-balance sm:text-6xl"
        >
          Mais Verde Começa Aqui
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-sm text-base leading-relaxed text-verde-escuro/70 sm:text-lg"
        >
          Plantas, vasos e acessórios para transformar seu ambiente e sua vida.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/produtos"
            className="group inline-flex items-center gap-2 rounded-full bg-verde-escuro px-7 py-3.5 text-sm font-semibold text-branco shadow-lg shadow-verde-escuro/20 transition-transform hover:scale-[1.03]"
          >
            Comprar agora
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
