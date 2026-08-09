"use client";

import { useState } from "react";
import { Droplets, CloudRain, Loader2, MapPin, Sun } from "lucide-react";
import { species } from "@/lib/data/species";
import { geocodeCity, getForecast, type DailyForecast, type GeoResult } from "@/lib/weather";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarioRegaClient() {
  const [selected, setSelected] = useState(species[0].slug);
  const current = species.find((s) => s.slug === selected)!;

  const [city, setCity] = useState("");
  const [place, setPlace] = useState<GeoResult | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setForecast(null);
    try {
      const results = await geocodeCity(city);
      if (results.length === 0) throw new Error("Cidade não encontrada");
      const best = results[0];
      setPlace(best);
      const days = await getForecast(best.latitude, best.longitude);
      setForecast(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar previsão");
    } finally {
      setLoading(false);
    }
  }

  const rainySoon = forecast?.slice(0, 2).some((d) => d.precipitationProbability >= 50);

  return (
    <div className="container-px mx-auto max-w-[900px] py-12 sm:py-16">
      <div className="rounded-3xl border border-verde-claro/30 bg-branco/90 p-8 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-escuro text-verde-claro">
          <Droplets size={20} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-verde-escuro sm:text-3xl">
          Calendário de Rega
        </h1>
        <p className="mt-2 max-w-xl text-verde-escuro/70">
          Selecione a espécie para ver a recomendação de rega personalizada.
        </p>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-6 w-full rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm text-verde-escuro outline-none focus:border-verde-musgo sm:max-w-sm"
        >
          {species.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.popularName}
            </option>
          ))}
        </select>

        <div className="mt-8 rounded-2xl bg-verde-escuro p-8 text-branco">
          <p className="text-sm font-medium uppercase tracking-widest text-verde-claro">
            {current.popularName}
          </p>
          <p className="mt-2 text-lg leading-relaxed">{current.water}</p>
          <p className="mt-4 text-sm text-areia/70">Umidade ideal: {current.humidity}</p>
        </div>

        <div className="mt-8 border-t border-verde-claro/25 pt-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-verde-escuro">
            <CloudRain size={17} className="text-verde-musgo" />
            Ajuste com a previsão do tempo da sua cidade
          </p>
          <form onSubmit={handleSearch} className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm focus-within:border-verde-musgo">
              <MapPin size={16} className="shrink-0 text-verde-escuro/50" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sua cidade (ex: Curitiba)"
                className="w-full bg-transparent text-verde-escuro outline-none placeholder:text-verde-escuro/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded-full bg-verde-escuro px-5 py-2.5 text-sm font-semibold text-branco transition-colors hover:bg-verde-musgo disabled:opacity-40"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Buscar"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-terracota">{error}</p>}

          {forecast && place && (
            <div className="mt-5">
              <div
                className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${
                  rainySoon
                    ? "bg-verde-musgo/10 text-verde-escuro"
                    : "bg-dourado/10 text-verde-escuro"
                }`}
              >
                {rainySoon ? (
                  <CloudRain size={18} className="mt-0.5 shrink-0 text-verde-musgo" />
                ) : (
                  <Sun size={18} className="mt-0.5 shrink-0 text-dourado" />
                )}
                <p>
                  <strong>
                    {place.name}
                    {place.admin1 ? `, ${place.admin1}` : ""}:
                  </strong>{" "}
                  {rainySoon
                    ? "chuva prevista nos próximos dias — se essa espécie fica na varanda ou área externa, você pode pular a próxima rega."
                    : "sem previsão de chuva relevante — mantenha a rotina de rega normalmente."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {forecast.map((d) => {
                  const date = new Date(d.date + "T12:00:00");
                  return (
                    <div
                      key={d.date}
                      className="flex flex-col items-center gap-1 rounded-xl bg-verde-escuro/[0.04] py-3 text-center"
                    >
                      <span className="text-[11px] font-semibold uppercase text-verde-escuro/50">
                        {WEEKDAYS[date.getDay()]}
                      </span>
                      <CloudRain
                        size={16}
                        className={
                          d.precipitationProbability >= 50 ? "text-verde-musgo" : "text-verde-escuro/25"
                        }
                      />
                      <span className="text-xs font-semibold text-verde-escuro">
                        {Math.round(d.precipitationProbability)}%
                      </span>
                      <span className="text-[11px] text-verde-escuro/50">{Math.round(d.tempMax)}°C</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-verde-escuro/40">Previsão via Open-Meteo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
