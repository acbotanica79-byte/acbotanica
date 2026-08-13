import type { Metadata } from "next";
import { CONTACT_EMAIL, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos e condições de uso da loja ACCFG Botânica.",
  robots: { index: false, follow: true },
};

export default function TermosPage() {
  return (
    <div className="container-px mx-auto max-w-[800px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Antes de comprar
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-verde-escuro/60">
          Última atualização: agosto de 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-verde-escuro/80">
        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">1. Aceitação</h2>
          <p className="mt-2">
            Ao usar o site da ACCFG Botânica e/ou fazer um pedido, você concorda com estes Termos de
            Uso e com nossa{" "}
            <a href="/privacidade" className="text-verde-musgo underline underline-offset-2 hover:text-verde-escuro">
              Política de Privacidade
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">2. Produtos e preços</h2>
          <p className="mt-2">
            Fazemos o possível para manter fotos, descrições e preços atualizados. Como algumas
            plantas e peças são naturais ou artesanais, pequenas variações de tamanho, cor e formato
            em relação à foto são normais. Preços podem ser alterados sem aviso prévio, mas o valor
            cobrado é sempre o exibido no momento da finalização do pedido.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">3. Pedidos e pagamento</h2>
          <p className="mt-2">
            Os pagamentos são processados com segurança pelo Mercado Pago (PIX, cartão de crédito ou
            boleto). O pedido só é confirmado após a aprovação do pagamento. Reservamo-nos o direito
            de cancelar pedidos em caso de indisponibilidade do produto, informando e reembolsando o
            cliente quando aplicável.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">4. Frete e entrega</h2>
          <p className="mt-2">
            O frete é calculado automaticamente com base no seu CEP antes da finalização da compra.
            Compras acima de R${FREE_SHIPPING_THRESHOLD} têm frete grátis para produtos com estoque
            próprio; itens de fornecedores parceiros têm frete calculado separadamente. Prazos de
            entrega são estimativas e podem variar por fatores fora do nosso controle (transportadora,
            condições climáticas, etc.).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">5. Trocas e devoluções</h2>
          <p className="mt-2">
            Consulte nossa{" "}
            <a href="/trocas" className="text-verde-musgo underline underline-offset-2 hover:text-verde-escuro">
              página de Trocas e Devoluções
            </a>{" "}
            para prazos e condições.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">6. Conta do usuário</h2>
          <p className="mt-2">
            Ao criar uma conta (por Google ou link mágico por e-mail), você é responsável por manter o
            acesso ao seu e-mail seguro. Você pode solicitar a exclusão da sua conta a qualquer momento
            em &quot;Minha Conta&quot;.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">7. Propriedade intelectual</h2>
          <p className="mt-2">
            Todo o conteúdo do site (textos, imagens, identidade visual) pertence à ACCFG Botânica ou é
            usado sob licença, sendo proibida a reprodução sem autorização.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">8. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-verde-musgo underline underline-offset-2 hover:text-verde-escuro">
              {CONTACT_EMAIL}
            </a>
            . Estes termos são regidos pela legislação brasileira.
          </p>
        </section>
      </div>
    </div>
  );
}
