"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { IMG } from "@/lib/data/images";

interface Leaf {
  src: string;
  top: string;
  left: string;
  size: number;
  rotate: number;
  speed: number;
  opacity: number;
  blur?: boolean;
}

const LEAVES: Leaf[] = [
  { src: IMG.monsteraLeaf, top: "2%", left: "6%", size: 260, rotate: -12, speed: 0.15, opacity: 0.14 },
  { src: IMG.succulentClose, top: "18%", left: "82%", size: 200, rotate: 8, speed: 0.3, opacity: 0.12 },
  { src: IMG.leafPattern, top: "38%", left: "-2%", size: 300, rotate: 5, speed: 0.1, opacity: 0.13 },
  { src: IMG.cactusPot, top: "55%", left: "88%", size: 220, rotate: -6, speed: 0.25, opacity: 0.12 },
  { src: IMG.fernLeaves, top: "72%", left: "4%", size: 260, rotate: 10, speed: 0.2, opacity: 0.14 },
  { src: IMG.terrarium, top: "90%", left: "78%", size: 240, rotate: -8, speed: 0.18, opacity: 0.12 },
  { src: IMG.hangingPlant, top: "110%", left: "10%", size: 220, rotate: 4, speed: 0.28, opacity: 0.13 },
  { src: IMG.succulentArrangement, top: "128%", left: "70%", size: 260, rotate: -10, speed: 0.16, opacity: 0.12 },
  { src: IMG.whiteFlowerPlant, top: "148%", left: "0%", size: 240, rotate: 6, speed: 0.22, opacity: 0.13 },
  { src: IMG.potteryPlant, top: "165%", left: "85%", size: 220, rotate: -4, speed: 0.24, opacity: 0.12 },
];

function ParallaxLeaf({ leaf, index }: { leaf: Leaf; index: number }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => v * leaf.speed);

  return (
    <motion.div
      style={{
        position: "absolute",
        top: leaf.top,
        left: leaf.left,
        width: leaf.size,
        height: leaf.size,
        rotate: leaf.rotate,
        opacity: leaf.opacity,
        y,
      }}
      className="rounded-[40%] overflow-hidden"
    >
      <Image
        src={leaf.src}
        alt=""
        fill
        sizes="300px"
        className="object-cover"
        priority={index < 3}
      />
    </motion.div>
  );
}

export default function BackgroundScene() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-areia"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-areia via-areia/95 to-areia" />
      {LEAVES.map((leaf, i) => (
        <ParallaxLeaf key={i} leaf={leaf} index={i} />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(149,213,178,0.15),_transparent_60%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
}
