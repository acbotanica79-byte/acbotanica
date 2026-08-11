"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, Loader2 } from "lucide-react";
import { viveiros, haversineKm } from "@/lib/data/viveiros";

const ViveirosMapInner = dynamic(() => import("./ViveirosMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl bg-verde-claro/15 text-sm text-verde-escuro/50 sm:h-96">
      Carregando mapa...
    </div>
  ),
});

export default function ViveirosMapClient() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada neste navegador.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Não foi possível obter sua localização. Verifique a permissão do navegador.");
        setLocating(false);
      }
    );
  }

  const sorted = userLocation
    ? [...viveiros].sort(
        (a, b) =>
          haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
          haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
      )
    : viveiros;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-verde-escuro/60">
          {viveiros.length} viveiros parceiros pelo Brasil
        </p>
        <button
          onClick={locate}
          disabled={locating}
          className="flex items-center gap-2 rounded-full bg-verde-escuro px-4 py-2 text-sm font-semibold text-branco transition-colors hover:bg-verde-musgo disabled:opacity-50"
        >
          {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
          Usar minha localização
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-terracota">{error}</p>}

      <div className="mt-4">
        <ViveirosMapInner userLocation={userLocation} />
      </div>

      <ul className="mt-6 divide-y divide-verde-claro/20">
        {sorted.map((v) => {
          const distance = userLocation
            ? haversineKm(userLocation.lat, userLocation.lng, v.lat, v.lng)
            : null;
          return (
            <li key={v.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <span className="font-medium text-verde-escuro">{v.name}</span>
                <p className="text-xs text-verde-escuro/55">{v.specialty}</p>
              </div>
              <div className="text-right">
                <span className="block text-sm text-verde-escuro/70">{v.city}</span>
                {distance !== null && (
                  <span className="text-xs font-semibold text-verde-musgo">
                    {distance < 1 ? "<1" : Math.round(distance)} km
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
