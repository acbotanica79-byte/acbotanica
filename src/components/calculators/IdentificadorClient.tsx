"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Upload, Sparkles, ArrowRight, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { species } from "@/lib/data/species";
import type { Species } from "@/lib/types";
import type { PlantIdentification } from "@/lib/ai/gemini";

type LightAnswer = "pouca" | "indireta" | "pleno";
type ShapeAnswer = "recortadas" | "finas" | "roseta" | "espinhos";
type WaterAnswer = "semanal" | "quinzenal" | "raro";

const LIGHT_OPTIONS: { value: LightAnswer; label: string }[] = [
  { value: "pouca", label: "Pouca luz (cantos, corredores)" },
  { value: "indireta", label: "Luz indireta forte (perto de janela)" },
  { value: "pleno", label: "Sol direto (varanda, jardim)" },
];

const SHAPE_OPTIONS: { value: ShapeAnswer; label: string }[] = [
  { value: "recortadas", label: "Folhas grandes e recortadas" },
  { value: "finas", label: "Folhas finas, longas ou pontiagudas" },
  { value: "roseta", label: "Roseta carnuda de suculenta" },
  { value: "espinhos", label: "Tem espinhos (cacto)" },
];

const WATER_OPTIONS: { value: WaterAnswer; label: string }[] = [
  { value: "semanal", label: "Não me importo de regar toda semana" },
  { value: "quinzenal", label: "Prefiro regar a cada 2-3 semanas" },
  { value: "raro", label: "Quero regar o mínimo possível" },
];

function scoreSpecies(s: Species, light: LightAnswer, shape: ShapeAnswer, water: WaterAnswer) {
  let score = 0;
  const lightText = s.light.toLowerCase();
  const waterText = s.water.toLowerCase();
  const name = `${s.popularName} ${s.family}`.toLowerCase();

  if (light === "pouca" && (lightText.includes("baixa") || lightText.includes("sombra"))) score += 2;
  if (light === "indireta" && lightText.includes("indireta")) score += 2;
  if (light === "pleno" && (lightText.includes("sol pleno") || lightText.includes("sol direto"))) score += 2;

  if (shape === "recortadas" && (name.includes("monstera") || name.includes("costela"))) score += 3;
  if (shape === "finas" && (name.includes("espada") || name.includes("sansevieria"))) score += 3;
  if (shape === "roseta" && (name.includes("echeveria") || s.family.toLowerCase().includes("crassulaceae"))) score += 3;
  if (shape === "espinhos" && name.includes("cacto")) score += 3;

  if (water === "raro" && (waterText.includes("seca") || waterText.includes("2-3 semanas") || waterText.includes("2-4 semanas")))
    score += 2;
  if (water === "quinzenal" && waterText.includes("semanas")) score += 1;
  if (water === "semanal" && (waterText.includes("3-5 cm") || waterText.includes("úmid"))) score += 2;

  return score;
}

export default function IdentificadorClient() {
  const [step, setStep] = useState(0);
  const [light, setLight] = useState<LightAnswer | null>(null);
  const [shape, setShape] = useState<ShapeAnswer | null>(null);
  const [water, setWater] = useState<WaterAnswer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [identifyResult, setIdentifyResult] = useState<PlantIdentification | null>(null);

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setIdentifyResult(null);
    setIdentifyError(null);
    setIdentifying(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/identificar-planta", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setIdentifyError(
          data?.error === "not_configured"
            ? "Identificação por IA ainda não configurada."
            : data?.error ?? "Não foi possível identificar a planta."
        );
      } else {
        setIdentifyResult(data);
      }
    } catch {
      setIdentifyError("Não foi possível conectar ao identificador. Tente novamente.");
    } finally {
      setIdentifying(false);
    }
  }

  const results = useMemo(() => {
    if (!light || !shape || !water) return [];
    return [...species]
      .map((s) => ({ s, score: scoreSpecies(s, light, shape, water) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((r) => r.s);
  }, [light, shape, water]);

  function reset() {
    setStep(0);
    setLight(null);
    setShape(null);
    setWater(null);
  }

  const done = step === 3;

  return (
    <div className="container-px mx-auto max-w-[900px] py-12 sm:py-16">
      <div className="rounded-3xl border border-verde-claro/30 bg-branco/90 p-8 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
          <Camera size={20} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
          Identificador de Plantas
        </h1>
        <p className="mt-2 max-w-xl text-verde-escuro/70">
          Responda 3 perguntas rápidas sobre a planta que você tem (ou quer ter) e
          encontramos a espécie mais provável no nosso catálogo botânico.
        </p>

        {!done && (
          <div className="mt-8">
            <div className="mb-6 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-verde-escuro" : "bg-verde-claro/30"}`}
                />
              ))}
            </div>

            {step === 0 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-verde-escuro">
                  Quanta luz o local recebe?
                </legend>
                <div className="mt-4 flex flex-col gap-2">
                  {LIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setLight(opt.value);
                        setStep(1);
                      }}
                      className="rounded-xl border border-verde-claro/40 px-4 py-3 text-left text-sm text-verde-escuro transition-colors hover:border-verde-musgo hover:bg-verde-claro/10"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-verde-escuro">
                  Como são as folhas (ou o corpo da planta)?
                </legend>
                <div className="mt-4 flex flex-col gap-2">
                  {SHAPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setShape(opt.value);
                        setStep(2);
                      }}
                      className="rounded-xl border border-verde-claro/40 px-4 py-3 text-left text-sm text-verde-escuro transition-colors hover:border-verde-musgo hover:bg-verde-claro/10"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-verde-escuro">
                  Com que frequência você quer regar?
                </legend>
                <div className="mt-4 flex flex-col gap-2">
                  {WATER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setWater(opt.value);
                        setStep(3);
                      }}
                      className="rounded-xl border border-verde-claro/40 px-4 py-3 text-left text-sm text-verde-escuro transition-colors hover:border-verde-musgo hover:bg-verde-claro/10"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        )}

        {done && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-verde-musgo">
                <Sparkles size={16} />
                Melhores combinações para o seu ambiente
              </p>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-verde-escuro/60 hover:text-verde-escuro"
              >
                <RotateCcw size={14} /> Refazer
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {results.map((s) => (
                <Link
                  key={s.slug}
                  href={`/especies/${s.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-verde-claro/30 transition-colors hover:border-verde-musgo"
                >
                  <div className="relative h-36 w-full">
                    <Image src={s.images[0]} alt={s.popularName} fill sizes="400px" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg font-semibold text-verde-escuro">{s.popularName}</p>
                    <p className="text-xs italic text-verde-escuro/50">{s.scientificName}</p>
                    <p className="mt-2 text-sm text-verde-escuro/70">{s.light}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-verde-musgo">
                      Ver espécie <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-verde-claro/25 pt-8">
          <p className="text-sm font-semibold text-verde-escuro">
            Já tem a planta e quer confirmar a espécie por foto?
          </p>
          <label className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-verde-claro/50 py-12 text-center cursor-pointer transition-colors hover:border-verde-musgo hover:bg-verde-claro/5">
            {previewUrl ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-xl">
                <Image src={previewUrl} alt={fileName ?? "Foto enviada"} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <Upload size={24} className="text-verde-musgo" />
            )}
            <span className="text-sm font-medium text-verde-escuro">
              {fileName ?? "Clique para enviar uma foto"}
            </span>
            <span className="text-xs text-verde-escuro/50">JPG, PNG até 10MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
          </label>

          {identifying && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-verde-escuro/[0.05] p-5 text-sm text-verde-escuro/80">
              <Loader2 size={16} className="animate-spin" /> Analisando a foto...
            </div>
          )}

          {identifyError && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-terracota/10 p-5 text-sm text-terracota">
              <AlertCircle size={16} className="shrink-0" /> {identifyError}
            </div>
          )}

          {identifyResult && !identifying && (
            <div className="mt-4 rounded-2xl bg-verde-escuro/[0.05] p-5">
              {identifyResult.isPlant ? (
                <>
                  <p className="flex items-center gap-2 text-sm font-semibold text-verde-musgo">
                    <Sparkles size={16} /> Confiança {identifyResult.confidence}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold text-verde-escuro">
                    {identifyResult.popularName}
                  </p>
                  <p className="text-xs italic text-verde-escuro/50">
                    {identifyResult.scientificName}
                    {identifyResult.family ? ` · ${identifyResult.family}` : ""}
                  </p>
                  <p className="mt-3 text-sm text-verde-escuro/80">{identifyResult.careTips}</p>
                  <p className="mt-4 text-xs text-verde-escuro/50">
                    Identificação por IA — pode errar. Em caso de dúvida,{" "}
                    <a href="/contato" className="font-semibold text-verde-musgo underline underline-offset-2">
                      fale com nossa equipe botânica
                    </a>
                    .
                  </p>
                </>
              ) : (
                <p className="text-sm text-verde-escuro/80">{identifyResult.careTips}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
