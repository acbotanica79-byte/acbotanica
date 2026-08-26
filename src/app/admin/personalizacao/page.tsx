import { getSiteTheme } from "@/lib/theme";
import { getAllSiteBannersForAdmin } from "@/lib/data/siteBanners";
import PersonalizacaoClient from "@/components/admin/PersonalizacaoClient";

export default async function AdminPersonalizacaoPage() {
  const [theme, banners] = await Promise.all([getSiteTheme(), getAllSiteBannersForAdmin()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-verde-escuro">Personalização</h1>
      <p className="mt-1 text-sm text-verde-escuro/60">
        Cores, banners e a foto principal da home — tudo o que dá a cara do site, editável por aqui.
      </p>
      <div className="mt-6">
        <PersonalizacaoClient initialTheme={theme} initialBanners={banners} />
      </div>
    </div>
  );
}
