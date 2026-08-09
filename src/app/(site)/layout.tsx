import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundScene from "@/components/layout/BackgroundScene";
import CommandPalette from "@/components/search/CommandPalette";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundScene />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <CommandPalette />
      <WhatsAppButton />
    </>
  );
}
