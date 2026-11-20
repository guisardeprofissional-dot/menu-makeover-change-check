import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/orbit-logo.png.asset.json";
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <img src={logo.url} alt="Logotipo Orbit" />
        <div>
          <strong>ORBIT</strong>
          <small>ATENDIMENTO INTELIGENTE</small>
        </div>
      </Link>
      <nav>
        <Link to="/">Experiência</Link>
        <Link to="/cardapio">Cardápio de teste</Link>
        <Link to="/painel">
          Painel de teste <ArrowUpRight size={14} />
        </Link>
      </nav>
      <Button asChild className="whatsapp-button">
        <a href="https://wa.me/5562999396556" target="_blank" rel="noreferrer">
          <MessageCircle /> WhatsApp da pizzaria
        </a>
      </Button>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>ORBIT</strong>
        <p>Seu atendimento. Uma conversa à frente.</p>
      </div>
      <div>
        <p>Demonstração com o cardápio da Absolluto Pizzaria</p>
        <p>Terça a domingo · 18h30 às 22h30 · Damianópolis–GO</p>
      </div>
      <a href="https://wa.me/5562999396556" target="_blank" rel="noreferrer">
        WhatsApp da Absolluto ↗
      </a>
      <small>Atendimento e pedidos reais exclusivamente pelo WhatsApp.</small>
    </footer>
  );
}
