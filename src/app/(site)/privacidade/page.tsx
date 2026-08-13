import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a ACCFG Botânica coleta, usa e protege seus dados pessoais.",
  robots: { index: false, follow: true },
};

export default function PrivacidadePage() {
  return (
    <div className="container-px mx-auto max-w-[800px] py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracota">
          Seus dados, protegidos
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-verde-escuro sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-verde-escuro/60">
          Última atualização: agosto de 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-verde-escuro/80">
        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">1. Quais dados coletamos</h2>
          <p className="mt-2">
            Coletamos os dados que você mesmo nos fornece ao criar conta, fazer login, finalizar um
            pedido ou entrar em contato: nome, e-mail, telefone, CPF (opcional), endereço de entrega
            e, quando você usa login com Google, as informações básicas do seu perfil Google (nome e
            e-mail). Também guardamos o histórico dos seus pedidos.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">2. Como usamos seus dados</h2>
          <p className="mt-2">Usamos seus dados para:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Processar e entregar seus pedidos, incluindo cálculo de frete;</li>
            <li>Comunicar sobre o andamento da sua compra;</li>
            <li>Manter sua conta e histórico de pedidos, se você optar por criar uma;</li>
            <li>Responder dúvidas enviadas pelo formulário de contato;</li>
            <li>Enviar novidades por e-mail, caso você se cadastre na nossa newsletter.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">3. Com quem compartilhamos</h2>
          <p className="mt-2">
            Não vendemos seus dados. Compartilhamos apenas o necessário com prestadores de serviço que
            nos ajudam a operar a loja: <strong className="text-verde-escuro">Mercado Pago</strong>{" "}
            (processamento de pagamento), <strong className="text-verde-escuro">Google</strong> (login
            opcional) e <strong className="text-verde-escuro">Supabase</strong> (armazenamento seguro
            dos dados da conta e dos pedidos).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">4. Cookies</h2>
          <p className="mt-2">
            Usamos cookies e armazenamento local do navegador para manter seu carrinho, sua sessão de
            login e suas preferências (como CEP salvo pra frete). Não usamos cookies de rastreamento
            de terceiros para publicidade.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">5. Seus direitos (LGPD)</h2>
          <p className="mt-2">
            Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode a qualquer momento:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Acessar e corrigir seus dados em &quot;Minha Conta&quot; → &quot;Meus Dados&quot;;</li>
            <li>Solicitar a exclusão dos seus dados pessoais, disponível na própria &quot;Minha Conta&quot;;</li>
            <li>
              Pedir esclarecimentos sobre o uso dos seus dados escrevendo para{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-verde-musgo underline underline-offset-2 hover:text-verde-escuro">
                {CONTACT_EMAIL}
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">6. Segurança</h2>
          <p className="mt-2">
            Seus dados são armazenados com criptografia e controle de acesso restrito. Pagamentos são
            processados diretamente pelo Mercado Pago — não armazenamos dados de cartão de crédito em
            nossos servidores.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-verde-escuro">7. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre esta política podem ser enviadas para{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-verde-musgo underline underline-offset-2 hover:text-verde-escuro">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
