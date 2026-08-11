import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/conta/LoginForm";

export const metadata: Metadata = {
  title: "Minha Conta",
  description: "Entre ou crie sua conta ACCFG Botânica.",
  robots: { index: false, follow: true },
};

export default async function ContaPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/conta/painel");
  }

  return (
    <div className="container-px mx-auto flex max-w-[480px] flex-col items-center py-16 sm:py-24 animate-fade-up">
      <LoginForm />
    </div>
  );
}
