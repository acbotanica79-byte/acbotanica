import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";
import StoreHydration from "@/components/StoreHydration";
import { getSiteTheme, themeToCssVars } from "@/lib/theme";
import ThemeProvider from "@/components/ThemeProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Loja Premium de Plantas, Suculentas e Jardinagem`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "plantas",
    "suculentas",
    "cactos",
    "jardinagem",
    "vasos",
    "terrários",
    "jardim vertical",
    "plantas de apartamento",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Loja Premium de Plantas, Suculentas e Jardinagem`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Loja Premium de Plantas, Suculentas e Jardinagem`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: "#1b4332",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getSiteTheme();

  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative bg-areia text-verde-escuro">
        {/* Sobrescreve as cores padrão do globals.css com a paleta personalizada
            em /admin/personalizacao — renderizado no servidor, sem flash. */}
        <style id="site-theme-vars" dangerouslySetInnerHTML={{ __html: themeToCssVars(theme) }} />
        <ThemeProvider>
          <StoreHydration />
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
