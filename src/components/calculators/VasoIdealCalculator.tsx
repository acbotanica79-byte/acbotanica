"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

const PLANT_SIZES = [
  { label: "Muda pequena (até 15cm)", growth: 1 },
  { label: "Planta jovem (15-40cm)", growth: 1.3 },
  { label: "Planta adulta (40-80cm)", growth: 1.6 },
  { label: "Planta grande (80cm+)", growth: 2 },
];

export default function VasoIdealCalculator() {
  const [currentDiameter, setCurrentDiameter] = useState(15);
  const [sizeIndex, setSizeIndex] = useState(1);

  const suggested = useMemo(() => {
    const growth = PLANT_SIZES[sizeIndex].growth;
    const raw = currentDiameter + currentDiameter * 0.2 * growth;
    return Math.round(raw / 2) * 2;
  }, [currentDiameter, sizeIndex]);

  return (
    <div className="rounded-3xl border border-verde-claro/30 bg-branco/90 p-8 sm:p-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
        <Calculator size={20} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
        Calculadora de Vaso Ideal
      </h1>
      <p className="mt-2 max-w-xl text-verde-escuro/70">
        Informe o diâmetro do vaso atual e o porte da planta para descobrir o
        próximo tamanho de vaso recomendado.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-verde-escuro">
            Diâmetro do vaso atual: {currentDiameter} cm
          </label>
          <input
            type="range"
            min={6}
            max={60}
            value={currentDiameter}
            onChange={(e) => setCurrentDiameter(Number(e.target.value))}
            className="mt-3 w-full accent-verde-musgo"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-verde-escuro">Porte da planta</label>
          <select
            value={sizeIndex}
            onChange={(e) => setSizeIndex(Number(e.target.value))}
            className="mt-3 w-full rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm text-verde-escuro outline-none focus:border-verde-musgo"
          >
            {PLANT_SIZES.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-verde-escuro p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-verde-claro">
          Tamanho recomendado
        </p>
        <p className="mt-2 font-display text-5xl font-semibold text-branco">
          {suggested} cm
        </p>
        <p className="mt-2 text-sm text-areia/70">de diâmetro</p>
      </div>
    </div>
  );
}
