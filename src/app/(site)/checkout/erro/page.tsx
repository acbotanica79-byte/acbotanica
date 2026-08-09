import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutErroPage() {
  return (
    <div className="container-px mx-auto flex max-w-[700px] flex-col items-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-terracota/10 text-terracota">
        <XCircle size={32} />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold text-verde-escuro">Não foi possível concluir o pagamento</h1>
      <p className="mt-3 text-verde-escuro/70">
        O pedido não foi finalizado. Você pode tentar novamente ou falar com a gente pelo WhatsApp.
      </p>
      <Link
        href="/carrinho"
        className="mt-8 rounded-full bg-verde-escuro px-7 py-3 text-sm font-semibold text-areia hover:bg-verde-musgo"
      >
        Voltar ao carrinho
      </Link>
    </div>
  );
}
