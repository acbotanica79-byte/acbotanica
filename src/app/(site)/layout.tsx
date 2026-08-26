import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundScene from "@/components/layout/BackgroundScene";
import CommandPalette from "@/components/search/CommandPalette";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import IntroSplash from "@/components/layout/IntroSplash";
import { getSiteTheme } from "@/lib/theme";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const theme = await getSiteTheme();

  return (
    <>
      <IntroSplash logoUrl={theme.logoUrl} />
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-verde-escuro focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-areia"
      >
        Pular para o conteúdo
      </a>
      <BackgroundScene />
      <Header logoUrl={theme.logoUrl} phoneDisplay={theme.phoneDisplay} whatsappNumber={theme.whatsappNumber} freeShippingThreshold={theme.freeShippingThreshold} />
      <main id="conteudo-principal" className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
      <CommandPalette />
      <WhatsAppButton whatsappNumber={theme.whatsappNumber} />
    </>
  );
}
