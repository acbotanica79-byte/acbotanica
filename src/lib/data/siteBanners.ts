import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { Banner } from "@/lib/types";
import { banners as defaultBanners } from "@/lib/data/banners";

interface SiteBannerRow {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  cta_label: string;
  href: string;
}

export interface AdminBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  sortOrder: number;
  active: boolean;
}

/** Todos os banners (ativos ou não), pro painel de edição — nunca lança. */
export async function getAllSiteBannersForAdmin(): Promise<AdminBanner[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_banners")
      .select("id, image_url, title, subtitle, cta_label, href, sort_order, active")
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      title: row.title,
      subtitle: row.subtitle ?? "",
      ctaLabel: row.cta_label,
      href: row.href,
      sortOrder: row.sort_order,
      active: row.active,
    }));
  } catch {
    return [];
  }
}

/** Nunca lança: sem linhas cadastradas (ou tabela ainda não migrada), cai pro
 * carrossel padrão embutido no código — a home nunca fica sem banners. */
export async function getSiteBanners(): Promise<Banner[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_banners")
      .select("id, image_url, title, subtitle, cta_label, href")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return defaultBanners;

    return (data as SiteBannerRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle ?? "",
      image: row.image_url,
      href: row.href,
      cta: row.cta_label,
    }));
  } catch {
    return defaultBanners;
  }
}
