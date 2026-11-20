import {Link} from '@tanstack/react-router';
import {ArrowUpRight,MessageCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import logo from '@/assets/absolluto-logo.png.asset.json';
export function SiteHeader(){return <header className="site-header"><Link to="/" className="brand"><img src={logo.url} alt="Logotipo Absolluto"/><div><strong>ABSOLLUTO</strong><small>PIZZARIA</small></div></Link><nav><Link to="/">Experiência</Link><Link to="/cardapio">Cardápio</Link><Link to="/painel">Painel de teste <ArrowUpRight size={14}/></Link></nav><Button asChild className="whatsapp-button"><a href="https://wa.me/5562999396556" target="_blank" rel="noreferrer"><MessageCircle/> Pedir no WhatsApp</a></Button></header>}
export function SiteFooter(){return <footer className="site-footer"><div><strong>ABSOLLUTO PIZZARIA</strong><p>Sabor que você sente, qualidade que você confia.</p></div><div><p>Rua Paranaíba · Setor Bueno, Damianópolis–GO</p><p>Terça a domingo · 18h30 às 22h30</p></div><a href="https://wa.me/5562999396556" target="_blank" rel="noreferrer">(62) 9.9939-6556 ↗</a><small>Atendimento e pedidos reais exclusivamente pelo WhatsApp.</small></footer>}
