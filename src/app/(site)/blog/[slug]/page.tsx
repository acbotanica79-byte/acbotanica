import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import { blogPosts, getBlogPostBySlug } from "@/lib/data/blog";
import ShareButtons from "@/components/product/ShareButtons";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = post.relatedSlugs
    .map((s) => getBlogPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <article className="container-px mx-auto max-w-[820px] py-10 sm:py-14">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-verde-escuro/55">
        <Link href="/" className="hover:text-verde-musgo">Home</Link>
        <ChevronRight size={13} />
        <Link href="/blog" className="hover:text-verde-musgo">Blog</Link>
        <ChevronRight size={13} />
        <span className="text-verde-escuro">{post.title}</span>
      </nav>

      <span className="rounded-full bg-verde-claro/20 px-3 py-1 text-xs font-semibold text-verde-musgo">
        {post.category}
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-verde-escuro/60">
        <span>Por {post.author}</span>
        <span className="flex items-center gap-1">
          <Calendar size={14} /> {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {post.readMinutes} min de leitura
        </span>
      </div>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-areia">
        <Image src={post.image} alt={post.title} fill sizes="820px" priority className="object-cover" />
      </div>

      <div className="mt-8">
        <ShareButtons productName={post.title} />
      </div>

      <p className="mt-8 text-lg leading-relaxed text-verde-escuro/85">{post.excerpt}</p>
      <p className="mt-4 leading-relaxed text-verde-escuro/80 whitespace-pre-line">
        {post.content}
      </p>

      {related.length > 0 && (
        <div className="mt-16 border-t border-verde-claro/25 pt-10">
          <h2 className="mb-6 font-display text-xl font-semibold text-verde-escuro">
            Artigos relacionados
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex overflow-hidden rounded-2xl border border-verde-claro/25 bg-branco/90"
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-areia">
                  <Image src={p.image} alt={p.title} fill sizes="112px" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-4">
                  <h3 className="font-display text-sm font-semibold text-verde-escuro leading-snug">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
