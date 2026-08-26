import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagem não suportado (use JPG, PNG ou WEBP)." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Imagem muito grande (máximo 8MB)." }, { status: 400 });
  }

  const folder = formData?.get("folder");
  const safeFolder = typeof folder === "string" && /^[a-z-]+$/.test(folder) ? folder : "geral";
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    console.error("admin upload failed", uploadError);
    return NextResponse.json({ error: "Não foi possível enviar a imagem. Tente novamente." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("site-media").getPublicUrl(path);

  return NextResponse.json({ imageUrl: publicUrl });
}
