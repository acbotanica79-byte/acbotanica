import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundScene from "@/components/layout/BackgroundScene";
import CommandPalette from "@/components/search/CommandPalette";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";

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
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Loja Premium de Plantas, Suculentas e Jardinagem`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    apple: "/apple-icon.png",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-areia text-verde-escuro">
        <BackgroundScene />
        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
        <CommandPalette />
        <WhatsAppButton />
      </body>
    </html>
  );
}
