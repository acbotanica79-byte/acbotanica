import type { Metadata } from "next";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD, WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description: "Dúvidas comuns sobre pedidos, frete, pagamento e trocas na ACCFG Botânica.",
};

const faqs = [
  {
    q: "Quanto tempo leva pra receber meu pedido?",
    a: "O prazo varia pela distância até o seu CEP — calculamos o frete real (com prazo estimado) direto na página do produto ou no carrinho, antes de você fechar a compra.",
  },
  {
    q: "O frete é grátis?",
    a: `Frete grátis em compras acima de R$${FREE_SHIPPING_THRESHOLD} para produtos com estoque próprio, saindo do nosso depósito. Produtos com fornecedor (dropshipping) têm o frete calculado à parte, direto da origem do fornecedor.`,
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "PIX, cartão de crédito e boleto, processados com segurança pelo Mercado Pago.",
  },
  {
    q: "Como acompanho meu pedido?",
    a: "Se você fez login antes de comprar, acompanha tudo em \"Minha Conta\" → \"Meus Pedidos\". Também mandamos atualizações por e-mail.",
  },
  {
    q: "Posso trocar ou devolver um produto?",
    a: "Sim — você tem 7 dias corridos após o recebimento para solicitar troca ou devolução. Veja os detalhes na página de Trocas e Devoluções.",
  },
  {
    q: "As plantas são exatamente iguais às fotos?",
    a: "As fotos ilustram a espécie — como cada planta é natural, pode variar um pouco em tamanho e formato do exemplar exato que você vai receber.",
  },
  {
    q: "Como faço login sem senha?",
    a: "Você pode entrar com sua conta Google ou receber um link mágico por e-mail — sem precisar cadastrar senha.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-px mx-auto max-w-[800px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Ajuda
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Perguntas Frequentes
        </h1>
      </div>

      <div className="divide-y divide-verde-claro/20 rounded-2xl border border-verde-claro/25 bg-branco/90">
        {faqs.map(({ q, a }) => (
          <div key={q} className="p-6">
            <h2 className="font-display text-base font-semibold text-verde-escuro">{q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-verde-escuro/70">{a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-verde-claro/30 bg-verde-escuro/[0.03] p-6 text-center">
        <p className="text-verde-escuro/80">Não achou o que procurava?</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contato"
            className="rounded-full bg-verde-escuro px-6 py-2.5 text-sm font-semibold text-areia transition-colors hover:bg-verde-musgo"
          >
            Fale conosco
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-verde-claro/50 px-6 py-2.5 text-sm font-semibold text-verde-escuro transition-colors hover:bg-verde-claro/15"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
