import Hero from "@/components/home/Hero";
import BannerSlider from "@/components/home/BannerSlider";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ToolsTeaser from "@/components/home/ToolsTeaser";
import Newsletter from "@/components/home/Newsletter";
import BenefitsGrid from "@/components/home/BenefitsGrid";
import { getProducts } from "@/lib/data/products";

export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
      <FeaturedProducts products={products} />
      <BannerSlider />
      <Newsletter />
      <ToolsTeaser />
      <BenefitsGrid />
    </>
  );
}
