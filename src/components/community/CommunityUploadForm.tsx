"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CommunityUploadForm() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Escolha uma foto da sua planta primeiro.");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Sua sessão expirou — entre novamente.");
      setLoading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("community").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      setError("Não foi possível enviar a foto. Tente novamente.");
      setLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("community").getPublicUrl(path);

    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: publicUrl, caption }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível publicar agora.");
      return;
    }

    setFile(null);
    setPreview(null);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-verde-claro/50 bg-branco/60 py-8 text-center">
        <Camera size={28} className="text-verde-musgo" strokeWidth={1.5} />
        <p className="text-sm text-verde-escuro/70">Entre na sua conta para postar a foto da sua planta.</p>
        <Link
          href="/conta"
          className="flex items-center gap-2 rounded-full bg-verde-escuro px-5 py-2.5 text-sm font-semibold text-areia hover:bg-verde-musgo"
        >
          <LogIn size={15} /> Entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-verde-claro/30 bg-branco/90 p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-verde-claro/50 bg-areia/40 hover:border-verde-musgo">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview local antes do upload, não é imagem remota
            <img src={preview} alt="Prévia da foto" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-verde-escuro/50">
              <Camera size={22} />
              <span className="text-xs">Escolher foto</span>
            </span>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
        <div className="flex flex-1 flex-col gap-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Conte um pouco sobre essa planta..."
            rows={3}
            className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 text-sm outline-none focus:border-verde-musgo"
          />
          {error && <p className="text-sm text-terracota">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
            Postar foto
          </button>
        </div>
      </div>
    </form>
  );
}
