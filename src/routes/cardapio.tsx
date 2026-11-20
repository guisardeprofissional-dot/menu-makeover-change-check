import { createFileRoute } from "@tanstack/react-router";
import { MenuView } from "@/features/demo/menu";
import { SiteHeader, SiteFooter } from "@/features/demo/site-header";
export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio de teste | Orbit & Absolluto" },
      {
        name: "description",
        content:
          "Todos os sabores da Absolluto, pizzas P, M e G, doces e bebidas com preços completos.",
      },
      { property: "og:title", content: "Cardápio Absolluto Pizzaria" },
      {
        property: "og:description",
        content: "Escolha sua pizza inteira ou meio a meio. Pedidos reais pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <>
      <SiteHeader />
      <main className="menu-page">
        <div className="page-banner">
          <span className="eyebrow">ABSOLLUTO PIZZARIA</span>
          <p>Atendimento exclusivo no WhatsApp · seleção abaixo adiciona ao teste.</p>
        </div>
        <MenuView />
      </main>
      <SiteFooter />
    </>
  );
}
