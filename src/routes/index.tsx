import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  MessageCircle,
  Check,
  Clock,
  MapPin,
  ChefHat,
  ClipboardList,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/absolluto-pizzas.png.asset.json";
import orbit from "@/assets/orbit-logo.png.asset.json";
import { Phone } from "@/features/demo/phone";
import { SiteHeader } from "@/features/demo/site-header";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit | Atendimento inteligente no WhatsApp" },
      {
        name: "description",
        content:
          "Conheça o Orbit e experimente o atendimento e o painel com o cardápio da Absolluto. Pedidos reais exclusivamente pelo WhatsApp.",
      },
      { property: "og:title", content: "Orbit — seu atendimento, uma conversa à frente" },
      {
        property: "og:description",
        content:
          "Pizzas, sabores e uma experiência de atendimento no WhatsApp. Teste antes de pedir.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <img
            className="hero-photo"
            src={hero.url}
            alt="Pizzas de calabresa e mussarela com massa dourada"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="hero-tag">
              <span /> SEU ATENDIMENTO. UMA CONVERSA À FRENTE.
            </span>
            <h1>
              ORBIT<span className="hero-period">.</span>
            </h1>
            <div className="orbit-descriptor">
              Atendimento inteligente
              <br />
              no WhatsApp.
            </div>
            <p>
              Da primeira mensagem ao pedido confirmado.
              <br />
              Mais agilidade para atender. Mais tempo para crescer.
            </p>
            <div className="hero-actions">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Experimente o atendimento <ArrowRight />
              </Button>
              <Link to="/cardapio">
                Ver cardápio <ArrowRight size={17} />
              </Link>
            </div>
            <small>
              <MessageCircle size={15} /> Atendimento exclusivo no WhatsApp.
            </small>
          </div>
          <div className="hero-bottom">
            <span>
              <Clock size={15} /> Terça a domingo · 18h30–22h30
            </span>
            <span>
              <MapPin size={15} /> Damianópolis, GO
            </span>
            <span>Demonstração · Absolluto Pizzaria</span>
          </div>
        </section>
        <section className="experience" id="experience">
          <div className="experience-copy">
            <span className="eyebrow">CONHEÇA. CONVERSE. EXPERIMENTE.</span>
            <h2>
              Seu pedido começa
              <br />
              com um <em>“oi”.</em>
            </h2>
            <p>
              Conheça o Orbit em ação com o cardápio da Absolluto Pizzaria. Escolha sua pizza,
              personalize o pedido e confira tudo antes de confirmar.
            </p>
            <div className="experience-points">
              {[
                "Escolha sabores, tamanhos e meio a meio",
                "Acrescente bebidas e observações",
                "Confira o total e o troco antes de confirmar",
              ].map((t) => (
                <div key={t}>
                  <span>
                    <Check size={16} />
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <div className="orbit-signature">
              <img src={orbit.url} alt="Robô Orbit" />
              <div>
                <strong>Orbit cuida da conversa.</strong>
                <span>Você cuida do seu negócio.</span>
              </div>
            </div>
            <div className="demo-label">
              <span>DEMONSTRAÇÃO</span>
              <p>
                Este espaço é só para testar. Seu pedido de verdade acontece exclusivamente no
                WhatsApp.
              </p>
            </div>
            <Button asChild size="lg" className="whatsapp-button">
              <a href="https://wa.me/5567984137155" target="_blank" rel="noreferrer">
                <MessageCircle /> Quero pedir de verdade <ArrowRight />
              </a>
            </Button>
          </div>
          <div className="phone-stack">
            <Phone />
            <div className="phone-ctas">
              <div className="phone-hint" role="note">
                <ArrowUp className="phone-hint-arrow" />
                Digite o seu pedido acima
              </div>
              <Button asChild size="lg" variant="outline" className="phone-cta">
                <Link to="/painel">
                  Veja os seus pedidos · explore o painel <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="operations">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DA CONVERSA À COZINHA</span>
              <h2>Tudo em seu lugar.</h2>
            </div>
          </div>
          <div className="operations-grid">
            {[
              {
                icon: ClipboardList,
                title: "Pedidos organizados",
                text: "Itens, endereço, pagamento e observações juntos, do início à entrega.",
              },
              {
                icon: ChefHat,
                title: "Cardápio do seu jeito",
                text: "Sabores, tamanhos, valores e disponibilidade em um só lugar.",
              },
              {
                icon: Wallet,
                title: "Valores sem surpresa",
                text: "Total atualizado, acréscimos do cartão e troco calculado.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={27} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="closing-band">
          <div>
            <span className="eyebrow">PIZZA BOA TEM ENDEREÇO.</span>
            <h2>
              Seu próximo pedido.
              <br />
              Uma conversa mais simples.
            </h2>
          </div>
          <Button size="lg" asChild className="whatsapp-button">
            <a href="https://wa.me/5567984137155" target="_blank" rel="noreferrer">
              <MessageCircle /> Chamar no WhatsApp <ArrowRight />
            </a>
          </Button>
        </section>
      </main>

    </>
  );
}
