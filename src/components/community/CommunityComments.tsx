"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CommunityComment } from "@/lib/data/community";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function CommunityComments({ postId, comments }: { postId: string; comments: CommunityComment[] }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text.trim() }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível comentar agora.");
      return;
    }

    setText("");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {comments.length === 0 && (
          <p className="text-sm text-verde-escuro/50">Seja a primeira pessoa a comentar.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verde-claro/30 text-xs font-semibold text-verde-escuro">
              {c.authorName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-sm">
                <span className="font-semibold text-verde-escuro">{c.authorName}</span>{" "}
                <span className="text-verde-escuro/50">· {timeAgo(c.createdAt)}</span>
              </p>
              <p className="text-sm text-verde-escuro/80">{c.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {loggedIn === false ? (
        <p className="mt-5 text-sm text-verde-escuro/50">Entre na sua conta para comentar.</p>
      ) : loggedIn === true ? (
        <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva um comentário..."
            className="w-full rounded-full border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-escuro text-areia hover:bg-verde-musgo disabled:opacity-50"
            aria-label="Enviar comentário"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      ) : null}
      {error && <p className="mt-2 text-sm text-terracota">{error}</p>}
    </div>
  );
}
