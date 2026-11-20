import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  RotateCcw,
  Signal,
  Wifi,
  Battery,
  Smile,
  Paperclip,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/absolluto-logo.png.asset.json";
import { useDemo } from "./store";
export function Phone() {
  const { messages, send, reset } = useDemo();
  const [input, setInput] = useState("");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = log.current;
    const last = container?.lastElementChild;
    if (container && last instanceof HTMLElement)
      container.scrollTop = last.offsetTop - container.offsetTop;
  }, [messages]);
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-status">
          <span>9:41</span>
          <div className="phone-notch" />
          <span>
            <Signal size={13} />
            <Wifi size={13} />
            <Battery size={17} />
          </span>
        </div>
        <div className="chat-header">
          <ArrowLeft size={20} />
          <img src={logo.url} alt="" />
          <div>
            <strong>Absolluto Pizzaria</strong>
            <small>atendimento de demonstração</small>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reiniciar conversa"
            title="Reiniciar conversa"
            onClick={reset}
          >
            <RotateCcw />
          </Button>
          <MoreVertical size={18} />
        </div>
        <div className="chat-log" ref={log}>
          <div className="chat-date">HOJE</div>
          <div className="chat-notice">🔒 Conversa de teste. Nenhum pedido real é enviado.</div>
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <div>
                {m.text
                  .split(/(\*[^*]+\*)/g)
                  .map((s, j) =>
                    s.startsWith("*") ? <strong key={j}>{s.slice(1, -1)}</strong> : s,
                  )}
              </div>
              <small>9:41 {m.role === "user" && <CheckCheck size={13} />}</small>
            </div>
          ))}
        </div>
        <form
          className="chat-compose"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
            setInput("");
          }}
        >
          <div>
            <Smile size={20} />
            <input
              aria-label="Mensagem do cliente"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite uma mensagem"
            />
            <Paperclip size={18} />
          </div>
          <Button type="submit" size="icon" aria-label="Enviar mensagem" disabled={!input.trim()}>
            <Send size={19} />
          </Button>
        </form>
        <div className="phone-bottom" />
      </div>
      <p className="phone-caption">
        <span /> Experiência de teste · sem pedido real
      </p>
    </div>
  );
}
