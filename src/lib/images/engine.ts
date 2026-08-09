import "server-only";

export interface ImageResult {
  url: string;
  width: number;
  height: number;
  source: "pexels" | "pixabay";
  credit: string;
  creditUrl: string;
}

async function searchPexels(query: string): Promise<ImageResult | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`,
    { headers: { Authorization: key }, next: { revalidate: 60 * 60 * 24 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const photo = data.photos?.[0];
  if (!photo) return null;

  return {
    url: photo.src.large,
    width: photo.width,
    height: photo.height,
    source: "pexels",
    credit: photo.photographer,
    creditUrl: photo.url,
  };
}

async function searchPixabay(query: string): Promise<ImageResult | null> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;

  const res = await fetch(
    `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`,
    { next: { revalidate: 60 * 60 * 24 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data.hits?.[0];
  if (!hit) return null;

  return {
    url: hit.largeImageURL,
    width: hit.imageWidth,
    height: hit.imageHeight,
    source: "pixabay",
    credit: hit.user,
    creditUrl: `https://pixabay.com/${hit.type === "photo" ? "photos" : "videos"}/id-${hit.id}/`,
  };
}

/**
 * Busca a melhor imagem disponível para uma consulta, tentando Pexels
 * primeiro e caindo para Pixabay se não encontrar nada.
 *
 * Uso pretendido: imagens de ambientação, categorias, blog e hero.
 * NÃO usar para a foto principal de um produto real — o cliente precisa
 * ver a planta que vai receber, não uma foto de banco de imagens.
 */
export async function getBestImage(query: string): Promise<ImageResult | null> {
  const pexels = await searchPexels(query);
  if (pexels) return pexels;

  const pixabay = await searchPixabay(query);
  if (pixabay) return pixabay;

  return null;
}

async function searchPexelsMany(query: string, count: number): Promise<ImageResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`,
    { headers: { Authorization: key }, next: { revalidate: 60 * 60 * 24 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.photos ?? []).map(
    (photo: {
      src: { large: string };
      width: number;
      height: number;
      photographer: string;
      url: string;
    }) => ({
      url: photo.src.large,
      width: photo.width,
      height: photo.height,
      source: "pexels" as const,
      credit: photo.photographer,
      creditUrl: photo.url,
    })
  );
}

async function searchPixabayMany(query: string, count: number): Promise<ImageResult[]> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${Math.max(
      count,
      3
    )}&safesearch=true`,
    { next: { revalidate: 60 * 60 * 24 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.hits ?? []).map(
    (hit: { largeImageURL: string; imageWidth: number; imageHeight: number; user: string; id: number; type: string }) => ({
      url: hit.largeImageURL,
      width: hit.imageWidth,
      height: hit.imageHeight,
      source: "pixabay" as const,
      credit: hit.user,
      creditUrl: `https://pixabay.com/${hit.type === "photo" ? "photos" : "videos"}/id-${hit.id}/`,
    })
  );
}

/** Busca várias imagens para a mesma consulta (galeria de produto), Pexels prioritário, Pixabay completa o restante. */
export async function getImages(query: string, count = 3): Promise<ImageResult[]> {
  const pexels = await searchPexelsMany(query, count);
  if (pexels.length >= count) return pexels.slice(0, count);

  const pixabay = await searchPixabayMany(query, count - pexels.length);
  return [...pexels, ...pixabay].slice(0, count);
}
