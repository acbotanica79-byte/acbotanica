export interface Viveiro {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  specialty: string;
}

export const viveiros: Viveiro[] = [
  {
    id: "v-raizviva",
    name: "Viveiro Raiz Viva",
    city: "São Paulo, SP",
    lat: -23.5505,
    lng: -46.6333,
    specialty: "Folhagens tropicais e plantas de interior",
  },
  {
    id: "v-holambra",
    name: "Sítio Verde Encanto",
    city: "Holambra, SP",
    lat: -22.6237,
    lng: -47.0522,
    specialty: "Capital brasileira das flores — floríferas e ornamentais",
  },
  {
    id: "v-friburgo",
    name: "Viveiro Boa Terra",
    city: "Nova Friburgo, RJ",
    lat: -22.2819,
    lng: -42.5311,
    specialty: "Mudas de clima frio e hortênsias",
  },
  {
    id: "v-petropolis",
    name: "Cactos & Cia",
    city: "Petrópolis, RJ",
    lat: -22.5112,
    lng: -43.1779,
    specialty: "Cactos e suculentas raras",
  },
];

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
