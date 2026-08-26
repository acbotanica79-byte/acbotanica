"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/** Alterna claro/escuro. Só renderiza o ícone real depois de montar no
 * cliente — antes disso não dá pra saber o tema resolvido sem arriscar um
 * flash errado (o servidor não sabe a preferência do navegador). */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- guarda de montagem, precisa do cliente pra saber o tema resolvido
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={`inline-block h-8 w-8 shrink-0 ${className}`} aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-verde-claro/15 ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
