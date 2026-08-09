"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, User, Menu, X, LayoutGrid, Phone, Headset } from "lucide-react";
import { MAIN_NAV, SITE_OWNER, PHONE_DISPLAY, WHATSAPP_NUMBER, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useCartStore, cartCount } from "@/store/cart";
import { useSearchStore } from "@/store/search";
import { useFavoritesStore } from "@/store/favorites";
import CartDrawer from "@/components/cart/CartDrawer";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const openSearch = useSearchStore((s) => s.open);
  const favoriteIds = useFavoritesStore((s) => s.productIds);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount guard for persisted store
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = mounted ? cartCount(items) : 0;
  const favCount = mounted ? favoriteIds.length : 0;

  return (
    <>
      <div className="bg-verde-escuro text-areia text-xs sm:text-sm">
        <div className="container-px mx-auto max-w-[1600px] flex items-center justify-between gap-3 py-2">
          <span className="truncate">
            Frete grátis em compras acima de R$ {FREE_SHIPPING_THRESHOLD}
          </span>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1.5 text-areia/85">
              <Headset size={14} />
              Atendimento
            </span>
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-1.5 hover:text-verde-claro transition-colors">
              <Phone size={14} />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-branco/90 backdrop-blur-md shadow-[0_2px_20px_rgba(27,67,50,0.08)]"
            : "bg-branco/70 backdrop-blur-sm"
        }`}
      >
        <div className="container-px mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-verde-escuro text-verde-escuro font-display text-[10px] font-bold tracking-tight transition-transform group-hover:scale-105 sm:h-11 sm:w-11 sm:text-[11px]">
                ACCFG
              </span>
              <span className="flex min-w-0 flex-col leading-none">
                <span className="truncate font-display text-base font-semibold uppercase tracking-wide text-verde-escuro sm:text-xl md:text-2xl">
                  ACCFG Botânica
                </span>
                <span className="mt-1 hidden truncate text-[10px] font-medium uppercase tracking-wider text-verde-escuro/55 sm:block">
                  por {SITE_OWNER}
                </span>
              </span>
            </Link>

            <button
              onClick={openSearch}
              className="hidden lg:flex flex-1 max-w-md items-center gap-2 rounded-full border border-verde-claro/50 bg-branco/80 px-4 py-2.5 text-sm text-verde-escuro/50 transition-colors hover:border-verde-musgo"
            >
              <Search size={17} className="shrink-0" />
              <span className="flex-1 text-left">Buscar plantas, vasos, espécies...</span>
              <kbd className="shrink-0 rounded border border-verde-claro/40 px-1.5 py-0.5 text-[10px] font-semibold text-verde-escuro/45">
                Ctrl K
              </kbd>
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={openSearch}
                className="flex items-center rounded-full p-2.5 text-verde-escuro hover:bg-verde-claro/20 transition-colors lg:hidden"
                aria-label="Buscar"
              >
                <Search size={19} />
              </button>
              <Link
                href={isLoggedIn ? "/conta/painel" : "/conta"}
                className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isLoggedIn ? "text-verde-musgo bg-verde-claro/10 hover:bg-verde-claro/20" : "text-verde-escuro hover:bg-verde-claro/20"
                }`}
              >
                <User size={19} />
                <span className="hidden xl:inline">{isLoggedIn ? "Meu Painel" : "Minha Conta"}</span>
              </Link>
              <Link
                href="/favoritos"
                className="relative flex items-center gap-1.5 rounded-full p-2.5 text-verde-escuro hover:bg-verde-claro/20 transition-colors"
                aria-label="Favoritos"
              >
                <Heart size={19} />
                {favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracota px-1 text-[10px] font-bold text-branco">
                    {favCount}
                  </span>
                )}
              </Link>
              <button
                onClick={openCart}
                className="relative flex items-center gap-1.5 rounded-full p-2.5 text-verde-escuro hover:bg-verde-claro/20 transition-colors"
                aria-label="Carrinho"
              >
                <ShoppingBag size={19} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracota px-1 text-[10px] font-bold text-branco">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="flex items-center rounded-full p-2.5 text-verde-escuro hover:bg-verde-claro/20 transition-colors lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 overflow-x-auto pb-3 text-sm font-medium text-verde-escuro/85 [scrollbar-width:none]">
            <Link
              href="/categorias"
              className="mr-2 flex shrink-0 items-center gap-2 rounded-full bg-verde-escuro px-4 py-2 text-sm font-semibold text-branco transition-colors hover:bg-verde-musgo"
            >
              <LayoutGrid size={16} />
              Todas as categorias
            </Link>
            {MAIN_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 whitespace-nowrap transition-colors hover:text-verde-musgo relative py-1 ${
                    active ? "text-verde-musgo" : ""
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-terracota" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-verde-escuro/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-branco shadow-2xl flex flex-col animate-[slide-in-right_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <div className="flex items-center justify-between p-5 border-b border-verde-claro/30">
              <span className="font-display text-xl font-semibold text-verde-escuro">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-verde-claro/20"
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1">
              {MAIN_NAV.map((item) => (
                  <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-3.5 text-base font-medium text-verde-escuro hover:bg-verde-claro/15 transition-colors ${
                    pathname === item.href ? "bg-verde-claro/20 text-verde-musgo" : ""
                  }`}
                >
                  {item.label}
                  {pathname === item.href && <span className="h-1.5 w-1.5 rounded-full bg-verde-musgo" />}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-verde-claro/30 flex flex-col gap-1">
                <Link href={isLoggedIn ? "/conta/painel" : "/conta"} className="rounded-lg px-3 py-3 text-base font-medium text-verde-escuro hover:bg-verde-claro/15">
                  {isLoggedIn ? "Meu Painel" : "Minha Conta"}
                </Link>
                <Link href="/favoritos" className="rounded-lg px-3 py-3 text-base font-medium text-verde-escuro hover:bg-verde-claro/15">
                  Favoritos
                </Link>
                <Link href="/carrinho" className="rounded-lg px-3 py-3 text-base font-medium text-verde-escuro hover:bg-verde-claro/15">
                  Carrinho
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  );
}
