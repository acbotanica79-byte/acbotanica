"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm hover:bg-branco/10"
    >
      <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
