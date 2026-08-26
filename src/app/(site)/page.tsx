import Hero from "@/components/home/Hero";
import BannerSlider from "@/components/home/BannerSlider";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ToolsTeaser from "@/components/home/ToolsTeaser";
import Newsletter from "@/components/home/Newsletter";
import BenefitsGrid from "@/components/home/BenefitsGrid";
import { getProducts } from "@/lib/data/products";
import { getSiteTheme } from "@/lib/theme";
import { getSiteBanners } from "@/lib/data/siteBanners";

export default async function Home() {
  const [products, theme, banners] = await Promise.all([getProducts(), getSiteTheme(), getSiteBanners()]);
  return (
    <>
      <Hero imageUrl={theme.heroImageUrl} headline={theme.heroHeadline} subheadline={theme.heroSubheadline} />
      <TrustStrip />
      <CategoryShowcase />
      <FeaturedProducts products={products} />
      <BannerSlider banners={banners} />
      <Newsletter />
      <ToolsTeaser />
      <BenefitsGrid />
    </>
  );
}
