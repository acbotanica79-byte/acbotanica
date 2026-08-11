import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { getCommunityPost, getCommunityComments } from "@/lib/data/community";
import CommunityComments from "@/components/community/CommunityComments";

export const dynamic = "force-dynamic";

export default async function ComunidadePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post) notFound();

  const comments = await getCommunityComments(id);

  return (
    <div className="container-px mx-auto max-w-[900px] py-12 sm:py-16">
      <Link href="/comunidade" className="flex items-center gap-1.5 text-sm font-medium text-verde-musgo hover:text-verde-escuro">
        <ChevronLeft size={16} /> Voltar para a comunidade
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-verde-claro/25 bg-branco/90">
        <div className="relative aspect-[4/3] w-full bg-areia sm:aspect-[16/9]">
          <Image src={post.imageUrl} alt={post.caption ?? "Foto de planta"} fill sizes="900px" className="object-cover" />
        </div>
        <div className="p-6">
          <p className="text-sm font-semibold text-verde-escuro">{post.authorName}</p>
          {post.caption && <p className="mt-2 text-verde-escuro/80">{post.caption}</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-verde-claro/25 bg-branco/90 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-verde-escuro">Comentários</h2>
        <CommunityComments postId={post.id} comments={comments} />
      </div>
    </div>
  );
}
