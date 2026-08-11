"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-full border border-terracota/30 px-4 py-2 text-sm font-semibold text-terracota transition-colors hover:bg-terracota hover:text-branco"
    >
      <LogOut size={16} /> Sair
    </button>
  );
}
