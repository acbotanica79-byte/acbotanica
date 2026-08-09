export interface GeoResult {
  name: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface DailyForecast {
  date: string;
  precipitationSum: number;
  precipitationProbability: number;
  tempMax: number;
}

export async function geocodeCity(query: string): Promise<GeoResult[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=5&language=pt&format=json&countryCode=BR`
  );
  if (!res.ok) throw new Error("Não foi possível buscar a cidade");
  const data = await res.json();
  return (data.results ?? []).map((r: { name: string; admin1?: string; latitude: number; longitude: number }) => ({
    name: r.name,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function getForecast(lat: number, lon: number): Promise<DailyForecast[]> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max&timezone=auto&forecast_days=7`
  );
  if (!res.ok) throw new Error("Não foi possível buscar a previsão");
  const data = await res.json();
  const days: string[] = data.daily.time;
  return days.map((date, i) => ({
    date,
    precipitationSum: data.daily.precipitation_sum[i],
    precipitationProbability: data.daily.precipitation_probability_max[i],
    tempMax: data.daily.temperature_2m_max[i],
  }));
}
