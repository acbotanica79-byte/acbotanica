import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { WHATSAPP_NUMBER, PHONE_DISPLAY, CONTACT_EMAIL, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export interface SiteTheme {
  verdeEscuro: string;
  verdeMusgo: string;
  verdeClaro: string;
  areia: string;
  terracota: string;
  dourado: string;
  heroImageUrl: string | null;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  logoUrl: string | null;
  whatsappNumber: string;
  phoneDisplay: string;
  contactEmail: string;
  freeShippingThreshold: number;
}

export const DEFAULT_THEME: SiteTheme = {
  verdeEscuro: "#1b4332",
  verdeMusgo: "#2d6a4f",
  verdeClaro: "#95d5b2",
  areia: "#f8f9fa",
  terracota: "#c77d4a",
  dourado: "#c9a66b",
  heroImageUrl: null,
  heroHeadline: null,
  heroSubheadline: null,
  logoUrl: null,
  whatsappNumber: WHATSAPP_NUMBER,
  phoneDisplay: PHONE_DISPLAY,
  contactEmail: CONTACT_EMAIL,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Só aceita hex de 6 dígitos — os valores vão parar direto num <style> inline. */
export function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

interface SiteThemeRow {
  verde_escuro: string | null;
  verde_musgo: string | null;
  verde_claro: string | null;
  areia: string | null;
  terracota: string | null;
  dourado: string | null;
  hero_image_url: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  phone_display: string | null;
  contact_email: string | null;
  free_shipping_threshold: number | string | null;
}

function safeHex(value: string | null | undefined, fallback: string): string {
  return isValidHexColor(value) ? value : fallback;
}

/** Nunca lança: se a tabela não existir ainda (migração não rodada) ou a
 * consulta falhar, cai pros valores padrão — o site sempre renderiza. */
export async function getSiteTheme(): Promise<SiteTheme> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("site_theme").select("*").eq("id", 1).maybeSingle<SiteThemeRow>();
    if (!data) return DEFAULT_THEME;
    return {
      verdeEscuro: safeHex(data.verde_escuro, DEFAULT_THEME.verdeEscuro),
      verdeMusgo: safeHex(data.verde_musgo, DEFAULT_THEME.verdeMusgo),
      verdeClaro: safeHex(data.verde_claro, DEFAULT_THEME.verdeClaro),
      areia: safeHex(data.areia, DEFAULT_THEME.areia),
      terracota: safeHex(data.terracota, DEFAULT_THEME.terracota),
      dourado: safeHex(data.dourado, DEFAULT_THEME.dourado),
      heroImageUrl: data.hero_image_url || null,
      heroHeadline: data.hero_headline || null,
      heroSubheadline: data.hero_subheadline || null,
      logoUrl: data.logo_url || null,
      whatsappNumber: data.whatsapp_number || DEFAULT_THEME.whatsappNumber,
      phoneDisplay: data.phone_display || DEFAULT_THEME.phoneDisplay,
      contactEmail: data.contact_email || DEFAULT_THEME.contactEmail,
      freeShippingThreshold:
        data.free_shipping_threshold != null && Number(data.free_shipping_threshold) > 0
          ? Number(data.free_shipping_threshold)
          : DEFAULT_THEME.freeShippingThreshold,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

/** CSS pronto pra injetar num <style> no topo do <body> — sobrescreve as
 * variáveis de cor do globals.css antes da primeira pintura (sem flash). */
export function themeToCssVars(theme: SiteTheme): string {
  return `:root{--color-verde-escuro:${theme.verdeEscuro};--color-verde-musgo:${theme.verdeMusgo};--color-verde-claro:${theme.verdeClaro};--color-areia:${theme.areia};--color-terracota:${theme.terracota};--color-dourado:${theme.dourado};}`;
}
