import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const SUPABASE_ORIGIN = "https://ovtynyevdrjpxgjkynwb.supabase.co";

const csp = [
  "default-src 'self'",
  // JSON-LD e alguns scripts do Next sao inline; sem isso a pagina de produto e outras quebram.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  // Tailwind/estilos inline via style={{}} (ex: BackgroundScene) exigem unsafe-inline aqui.
  "style-src 'self' 'unsafe-inline'",
  // https: aberto pra imagens (nao pra scripts/connect) porque o catalogo puxa fotos de
  // varias fontes (Pexels, Pixabay, iNaturalist, Flickr, OSM, e o CDN da CJ Dropshipping,
  // que muda de dominio e nao da pra listar fixo — ja quebrou uma vez com o mapa de viveiros).
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_ORIGIN} wss://ovtynyevdrjpxgjkynwb.supabase.co${isProd ? "" : " ws://localhost:*"}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "inaturalist-open-data.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "live.staticflickr.com",
      },
      {
        protocol: "https",
        hostname: "ovtynyevdrjpxgjkynwb.supabase.co",
      },
    ],
  },
};

export default nextConfig;
