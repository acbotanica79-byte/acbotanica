import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSucessoPage() {
  return (
    <div className="container-px mx-auto flex max-w-[700px] flex-col items-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-verde-musgo/10 text-verde-musgo">
        <CheckCircle2 size={32} />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold text-verde-escuro">Pedido recebido!</h1>
      <p className="mt-3 text-verde-escuro/70">
        Obrigado pela compra. Assim que o pagamento for confirmado, nossa equipe separa tudo com carinho e
        entra em contato para combinar a entrega.
      </p>
      <Link
        href="/produtos"
        className="mt-8 rounded-full bg-verde-escuro px-7 py-3 text-sm font-semibold text-areia hover:bg-verde-musgo"
      >
        Continuar comprando
      </Link>
    </div>
  );
}
