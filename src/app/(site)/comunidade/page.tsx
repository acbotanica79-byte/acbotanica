import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Leaf, MessageCircle } from "lucide-react";
import { getCommunityPosts } from "@/lib/data/community";
import CommunityUploadForm from "@/components/community/CommunityUploadForm";

export const metadata: Metadata = {
  title: "Comunidade",
  description: "Poste fotos das suas plantas e troque experiências com outros amantes de jardinagem.",
};

export const dynamic = "force-dynamic";

export default async function ComunidadePage() {
  const posts = await getCommunityPosts();

  return (
    <div className="container-px mx-auto max-w-[1200px] py-12 sm:py-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">ACCFG Botânica</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">Comunidade</h1>
        <p className="mt-2 max-w-2xl text-verde-escuro/70">
          Um espaço só para plantas: poste a foto da sua planta, conte como ela está e comente nas dos outros.
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-verde-claro/15 px-4 py-3 text-sm text-verde-escuro/70">
          <Leaf size={16} className="mt-0.5 shrink-0 text-verde-musgo" />
          <span>
            Só fotos de plantas — sem pessoas, sem produtos de terceiros. Assim fica um feed de verdade sobre
            jardinagem.
          </span>
        </div>
      </div>

      <div className="mb-10">
        <CommunityUploadForm />
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-verde-escuro/50">
          Ainda não tem nenhum post. Seja a primeira pessoa a compartilhar uma planta!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/comunidade/${post.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-verde-claro/25 bg-branco/90"
            >
              <div className="relative aspect-square overflow-hidden bg-areia">
                <Image
                  src={post.imageUrl}
                  alt={post.caption ?? "Foto de planta da comunidade"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                {post.caption && <p className="text-sm text-verde-escuro/80 line-clamp-2">{post.caption}</p>}
                <div className="mt-auto flex items-center justify-between pt-3 text-xs text-verde-escuro/50">
                  <span>{post.authorName}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} /> {post.commentCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
