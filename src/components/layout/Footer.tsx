import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { SITE_OWNER, PHONE_DISPLAY, CONTACT_EMAIL } from "@/lib/constants";
import { InstagramIcon, FacebookIcon, YoutubeIcon } from "@/components/icons/SocialIcons";

const columns = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Comunidade", href: "/comunidade" },
      { label: "Guias", href: "/guias" },
      { label: "Contato", href: "/contato" },
      { label: "Trabalhe Conosco", href: "/carreiras" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Perguntas Frequentes", href: "/faq" },
      { label: "Trocas e Devoluções", href: "/trocas" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: "Termos de Uso", href: "/termos" },
    ],
  },
  {
    title: "Descubra",
    links: [
      { label: "Espécies", href: "/especies" },
      { label: "Cuidados", href: "/cuidados" },
      { label: "Calculadoras", href: "/calculadoras" },
      { label: "Novidades", href: "/novidades" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-verde-claro/30 bg-verde-escuro text-areia">
      <div className="container-px mx-auto max-w-[1600px] py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="relative h-9 w-9 shrink-0">
                <Image src="/logo-mark-light.png" alt="" fill sizes="36px" className="object-contain" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-semibold uppercase tracking-wide">ACCFG Botânica</span>
                <span className="mt-1 text-[10px] uppercase tracking-wider text-areia/55">por {SITE_OWNER}</span>
              </span>
            </Link>
            <p className="text-sm text-areia/70 max-w-xs leading-relaxed">
              Curadoria de plantas, suculentas e artigos de jardinagem premium.
              Natureza, sofisticação e cuidado em cada detalhe.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[InstagramIcon, FacebookIcon, YoutubeIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-areia/10 hover:bg-verde-claro hover:text-verde-escuro transition-colors"
                  aria-label="Rede social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-verde-claro mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-areia/75">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-verde-claro transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display text-sm font-semibold text-verde-claro mb-4">
              Categorias
            </h4>
            <ul className="space-y-2.5 text-sm text-areia/75">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="hover:text-verde-claro transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3 border-t border-areia/15 pt-8 text-sm text-areia/70">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-verde-claro shrink-0" />
            São Paulo, SP — Brasil
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-verde-claro shrink-0" />
            {PHONE_DISPLAY}
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-verde-claro shrink-0" />
            {CONTACT_EMAIL}
          </div>
        </div>
      </div>

      <div className="border-t border-areia/15 py-5">
        <div className="container-px mx-auto max-w-[1600px] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-areia/60">
          <p>© {new Date().getFullYear()} ACCFG Botânica. Todos os direitos reservados.</p>
          <p>PIX · Cartão de crédito · Boleto — pagamento seguro via Mercado Pago</p>
        </div>
      </div>
    </footer>
  );
}
