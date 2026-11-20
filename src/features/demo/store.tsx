import { createContext, useContext, useState, type ReactNode } from "react";
import {
  initialMenu,
  blank,
  type Menu,
  type Order,
  type Conversation,
  type Chat,
  advance,
  chatMenu,
  defaultWelcome,
} from "./engine";
const welcome: Chat = {
  role: "bot",
  text: defaultWelcome + "\n\n" + chatMenu(initialMenu),
};
export type Settings = {
  bot: boolean;
  open: boolean;
  fee: number;
  pix: string;
  holder: string;
  welcome: string;
  closed: string;
  autoPrint: boolean;
  paper: string;
  font: string;
};
function useDemoState() {
  const [menu, setMenu] = useState<Menu>(structuredClone(initialMenu));
  const [orders, setOrders] = useState<Order[]>([]);
  const [conversation, setConversation] = useState<Conversation>(blank);
  const [messages, setMessages] = useState<Chat[]>([welcome]);
  const [settings, setSettings] = useState<Settings>({
    bot: true,
    open: true,
    fee: 0,
    pix: "43366274000101",
    holder: "Edivanilson Apóstolo de Araújo",
    welcome: defaultWelcome,
    closed: "No momento estamos fechados. Assim que abrirmos, é só mandar um oi! 🍕",
    autoPrint: false,
    paper: "80",
    font: "12",
  });
  function send(text: string) {
    if (!text.trim()) return;
    const result = !settings.bot
      ? {
          c: conversation,
          reply: "⏸️ O atendente está pausado no painel de teste.",
          confirmed: false,
        }
      : !settings.open
        ? { c: conversation, reply: settings.closed, confirmed: false }
        : advance(conversation, text, menu, settings.fee);
    setConversation(result.c);
    setMessages((m) => [...m, { role: "user", text }, { role: "bot", text: result.reply }]);
    if (result.confirmed) {
      const c = result.c;
      const id = c.editId || orders.length + 1;
      const order: Order = {
        ...c,
        id,
        fee: c.zone === "retirada" ? 0 : settings.fee,
        status: "novo",
        created: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setOrders((o) => (c.editId ? o.map((i) => (i.id === id ? order : i)) : [order, ...o]));
      setConversation({ ...c, editId: id });
    }
  }
  function reset() {
    setConversation(blank());
    setMessages([{ role: "bot", text: settings.welcome + "\n\n" + chatMenu(menu) }]);
  }
  return {
    menu,
    setMenu,
    orders,
    setOrders,
    conversation,
    messages,
    settings,
    setSettings,
    send,
    reset,
  };
}
const Context = createContext<ReturnType<typeof useDemoState> | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const value = useDemoState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw Error("DemoProvider missing");
  return value;
}
