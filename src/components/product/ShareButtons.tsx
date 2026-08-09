"use client";

import { useState, useEffect } from "react";
import { Share2, Link2 } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";

function WhatsappIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 8.7c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5s.7 1.7.7 1.8.1.3 0 .5-.2.3-.4.5-.4.4-.2.7c.2.3.9 1.4 2 2.3 1.3 1.1 2 1.3 2.3 1.4.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1s1.6.7 1.9.9.5.2.5.4-.1 1-.5 1.4-1.4 1-2.4.7c-1.1-.3-3.4-1.2-4.9-2.9-1.5-1.6-2.3-3.4-2.4-3.7-.1-.3-.7-1.4-.6-2.7z"
        fill="currentColor"
      />
    </svg>
  );
}

function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 18c.5-1.5 1.5-5.5 1.5-5.5m0 0a2.5 2.5 0 104.7-1.5c-.6-2-3-2.2-4-.7-.7 1-.4 2 0 2.5m-.7-.3c-.6 2.6-1 4-1.4 4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ShareButtons({ productName }: { productName: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const text = encodeURIComponent(`Olha que ${productName} incrível que encontrei na AC Botânica!`);

  const links = [
    {
      label: "WhatsApp",
      icon: WhatsappIcon,
      href: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
    },
    {
      label: "Pinterest",
      icon: PinterestIcon,
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${text}`,
    },
    {
      label: "Facebook",
      icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm text-verde-escuro/60 mr-1">
        <Share2 size={15} /> Compartilhar
      </span>
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-verde-claro/50 text-verde-escuro transition-colors hover:bg-verde-claro/20"
        >
          <Icon size={15} />
        </a>
      ))}
      <span
        aria-label="Instagram"
        title="Copie o link para compartilhar no Instagram"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-verde-claro/50 text-verde-escuro/40"
      >
        <InstagramIcon size={15} />
      </span>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        aria-label="Copiar link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-verde-claro/50 text-verde-escuro transition-colors hover:bg-verde-claro/20"
      >
        <Link2 size={15} />
      </button>
      {copied && <span className="text-xs text-verde-musgo">Link copiado!</span>}
    </div>
  );
}
