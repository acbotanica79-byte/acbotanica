"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { SITE_NAME, SITE_OWNER } from "@/lib/constants";

const LEAF_COLORS = ["#95d5b2", "#2d6a4f", "#c9a66b", "#c77d4a"];

type Depth = "back" | "mid" | "front";

const DEPTH_CONFIG: Record<Depth, { count: number; sizeRange: [number, number]; blur: number; opacityPeak: number; z: number }> = {
  back: { count: 6, sizeRange: [14, 22], blur: 3, opacityPeak: 0.35, z: 0 },
  mid: { count: 6, sizeRange: [22, 32], blur: 0, opacityPeak: 0.75, z: 5 },
  front: { count: 5, sizeRange: [32, 46], blur: 0, opacityPeak: 1, z: 20 },
};

interface LeafConfig {
  id: string;
  depth: Depth;
  top: number;
  arcY: number;
  size: number;
  color: string;
  blur: number;
  peakOpacity: number;
  z: number;
  delay: number;
  duration: number;
  rotateFrom: number;
  rotateMid: number;
  rotateTo: number;
}

function makeLeaves(): LeafConfig[] {
  const leaves: LeafConfig[] = [];
  (Object.keys(DEPTH_CONFIG) as Depth[]).forEach((depth) => {
    const cfg = DEPTH_CONFIG[depth];
    for (let i = 0; i < cfg.count; i++) {
      const [min, max] = cfg.sizeRange;
      leaves.push({
        id: `${depth}-${i}`,
        depth,
        top: 4 + Math.random() * 88,
        arcY: -14 + Math.random() * 28,
        size: min + Math.random() * (max - min),
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        blur: cfg.blur,
        peakOpacity: cfg.opacityPeak,
        z: cfg.z,
        // Três rajadas escalonadas em vez de espalhamento uniforme — sensação de vento em golfadas.
        delay: [0, 0.35, 0.7][Math.floor(Math.random() * 3)] + Math.random() * 0.25,
        duration: depth === "front" ? 1.3 + Math.random() * 0.5 : 1.7 + Math.random() * 0.7,
        rotateFrom: Math.random() * 50 - 25,
        rotateMid: 160 + Math.random() * 120,
        rotateTo: 340 + Math.random() * 260,
      });
    }
  });
  return leaves;
}

const NAME_LETTERS = SITE_NAME.split("");

/**
 * Intro animada da loja: uma rajada de vento em três camadas de profundidade
 * (folhas desfocadas ao fundo, nítidas em primeiro plano) atravessa a tela em
 * arco e, ao passar, revela a marca com um brilho suave e o nome surgindo
 * letra a letra. Mostra uma vez por sessão do navegador (sessionStorage) —
 * não repete a cada navegação interna nem em visitas seguintes na mesma aba.
 * Some sozinha para quem prefere menos movimento (prefers-reduced-motion).
 */
export default function IntroSplash() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"leaves" | "exiting">("leaves");
  const leaves = useMemo(() => makeLeaves(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = sessionStorage.getItem("accfg-intro-seen");
    if (reducedMotion || alreadySeen) return;

    sessionStorage.setItem("accfg-intro-seen", "1");

    // setTimeout(0) em vez de setState direto no corpo do efeito: evita disparar
    // a animação antes da primeira pintura da página (e agrada o lint de
    // set-state-in-effect, que só permite setState dentro de um callback).
    const showTimer = setTimeout(() => setVisible(true), 0);
    const exitTimer = setTimeout(() => setPhase("exiting"), 2500);
    const hideTimer = setTimeout(() => setVisible(false), 3050);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-verde-escuro"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exiting" ? 0 : 1, scale: phase === "exiting" ? 1.04 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {/* vinheta suave de fundo, dá profundidade ao verde sólido */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(45,106,79,0.55), rgba(27,67,50,1) 70%)" }}
          />

          {leaves
            .filter((l) => l.depth === "back")
            .map((leaf) => (
              <LeafParticle key={leaf.id} leaf={leaf} />
            ))}

          {/* brilho por trás da marca, pulsa suavemente enquanto ela é revelada */}
          <motion.div
            className="absolute h-[280px] w-[280px] rounded-full sm:h-[360px] sm:w-[360px]"
            style={{ background: "radial-gradient(circle, rgba(201,166,107,0.28), transparent 70%)", zIndex: 8 }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{ delay: 0.7, duration: 0.9, ease: "easeOut" }}
          />

          <motion.div
            className="relative flex flex-col items-center gap-3 px-6 text-center"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0, scale: 0.88, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.75, duration: 0.65, ease: "easeOut" }}
          >
            <span className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <Image src="/logo-mark-light.png" alt="" fill sizes="64px" className="object-contain" priority />
            </span>
            <span className="font-display text-2xl font-semibold uppercase tracking-wide text-areia sm:text-3xl">
              {NAME_LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + i * 0.035, duration: 0.3, ease: "easeOut" }}
                >
                  {letter === " " ? " " : letter}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="text-xs font-medium uppercase tracking-wider text-areia/60 sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 + NAME_LETTERS.length * 0.035 + 0.15, duration: 0.4 }}
            >
              por {SITE_OWNER}
            </motion.span>
          </motion.div>

          {leaves
            .filter((l) => l.depth !== "back")
            .map((leaf) => (
              <LeafParticle key={leaf.id} leaf={leaf} />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LeafParticle({ leaf }: { leaf: LeafConfig }) {
  return (
    <motion.span
      className="absolute left-0"
      style={{ top: `${leaf.top}%`, zIndex: leaf.z, filter: leaf.blur ? `blur(${leaf.blur}px)` : undefined }}
      initial={{ x: "-15vw", y: 0, rotate: leaf.rotateFrom, opacity: 0 }}
      animate={{
        x: ["-15vw", "10vw", "90vw", "118vw"],
        y: [0, leaf.arcY * 0.3, leaf.arcY, leaf.arcY * 0.4],
        rotate: [leaf.rotateFrom, leaf.rotateFrom + (leaf.rotateMid - leaf.rotateFrom) * 0.3, leaf.rotateMid, leaf.rotateTo],
        opacity: [0, leaf.peakOpacity, leaf.peakOpacity, 0],
      }}
      transition={{ duration: leaf.duration, delay: leaf.delay, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
    >
      <Leaf size={leaf.size} color={leaf.color} strokeWidth={1.5} fill={leaf.color} fillOpacity={0.25} />
    </motion.span>
  );
}
