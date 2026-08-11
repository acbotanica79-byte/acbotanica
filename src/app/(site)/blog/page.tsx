import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { blogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notícias, guias e curiosidades sobre plantas, jardinagem e paisagismo.",
};

export default function BlogPage() {
  return (
    <div className="container-px mx-auto max-w-[1600px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          ACCFG Botânica Journal
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Blog
        </h1>
        <p className="mt-2 max-w-2xl text-verde-escuro/70">
          Guias, cuidados, curiosidades e tendências do mundo das plantas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-verde-claro/25 bg-branco/90"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-areia">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 rounded-full bg-verde-escuro px-3 py-1 text-[11px] font-semibold text-areia">
                {post.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-lg font-semibold text-verde-escuro leading-snug">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-verde-escuro/65 line-clamp-2">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-verde-escuro/50">
                <span>{post.author}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {post.readMinutes} min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
