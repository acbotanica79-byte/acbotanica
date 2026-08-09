import Hero from "@/components/home/Hero";
import BannerSlider from "@/components/home/BannerSlider";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ToolsTeaser from "@/components/home/ToolsTeaser";
import Newsletter from "@/components/home/Newsletter";
import BenefitsGrid from "@/components/home/BenefitsGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
      <FeaturedProducts />
      <BannerSlider />
      <Newsletter />
      <ToolsTeaser />
      <BenefitsGrid />
    </>
  );
}
