import source from "@/data/pizzeria.json";
export type MenuItem = { name: string; price: number; desc: string; enabled?: boolean };
export type Menu = {
  categories: { name: string; items: MenuItem[] }[];
  drinks: { id: string; name: string; price: number; enabled: boolean }[];
  notes: string;
};
export type Line = {
  name: string; qty: number; price: number; obs?: string;
  halves?: { name: string; price: number }[];
};
export const defaultPix = { pix: "12345678", holder: "orbit pizzaria" };
export type Order = {
  id: number;
  name: string;
  phone: string;
  items: Line[];
  zone: string;
  address: string;
  payment: string;
  cash: number;
  fee: number;
  status: string;
  created: string;
};
export type Chat = { role: "bot" | "user"; text: string };
export type Conversation = {
  step: string;
  items: Line[];
  name: string;
  phone: string;
  zone: string;
  address: string;
  payment: string;
  cash: number;
  editId?: number;
  pendingPizza?: string;
};
export const blank = (): Conversation => ({
  step: "items",
  items: [],
  name: "",
  phone: "",
  zone: "",
  address: "",
  payment: "",
  cash: 0,
});
export const money = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export const initialMenu: Menu = source.menu;
export const defaultWelcome =
  "Boa noite! 🤠🍕 Seja muito bem-vindo à Absolluto Pizzaria! Sabor que você sente, qualidade que você confia! 😋 Segue abaixo nosso cardápio: 📋🍕";
export function chatMenu(menu: Menu) {
  const sections = menu.categories.map((category) => {
    const flavors = new Map<string, MenuItem[]>();
    for (const item of category.items.filter((item) => item.enabled !== false)) {
      const name = item.name.replace(/ [PMG]$/, "");
      flavors.set(name, [...(flavors.get(name) ?? []), item]);
    }
    if (!flavors.size) return "";
    return `*${category.name}*\n\n${[...flavors].map(([name, items]) => {
      const prices = items.map((item) => `${item.name.match(/ [PMG]$/)?.[0]?.trim() ?? "Preço"}: ${money(item.price)}`).join(" · ");
      return `🍕 *${name.replace(/^Pizza /, "")}*\n${prices}`;
    }).join("\n\n")}`;
  }).filter(Boolean);
  const drinks = menu.drinks.filter((drink) => drink.enabled);
  if (drinks.length) sections.push(`*🥤 Bebidas*\n${drinks.map((drink) => `${drink.name} — ${money(drink.price)}`).join("\n")}`);
  return `📋 *CARDÁPIO ABSOLLUTO PIZZARIA*\n\n${sections.join("\n\n")}\n\n🍕😋 Qual pizza e tamanho você deseja? Pode escolher inteira ou meio a meio! 🤠🙏`;
}
export const total = (items: Line[], _payment = "", fee = 0) =>
  Math.round((items.reduce((n, i) => n + i.qty * i.price, 0) + fee) * 100) / 100;
export const halfPrice = (a: number, b: number) => Math.round(((a + b) / 2) * 100) / 100;
export function receiptDetails(c: Conversation, fee: number, pix = defaultPix) {
  return {
    pizzaCount: c.items.filter((item) => item.name.startsWith("Pizza ")).reduce((n, item) => n + item.qty, 0),
    total: total(c.items, c.payment, fee),
    pix: c.payment === "pix" ? { key: pix.pix, holder: pix.holder } : undefined,
  };
}
export function summary(c: Conversation, fee: number, pix = defaultPix) {
  const receipt = receiptDetails(c, fee, pix);
  const paymentLabel = { pix: "PIX", debito: "Cartão de débito", credito: "Cartão de crédito", dinheiro: "Dinheiro" }[c.payment] ?? c.payment;
  const lines = c.items.map((item) => {
    const halves = item.halves?.map((half) => `½ ${half.name.replace(/^Pizza /, "")} ${money(half.price)}`).join(" + ");
    return `${item.name.startsWith("Pizza ") ? "🍕" : "🥤"} ${item.qty}x ${item.name} — ${money(item.qty * item.price)}${halves ? `\n\n   ${halves} = ${money(item.price)}` : ""}${item.obs ? `\n\n   ${item.obs}` : ""}`;
  });
  return `📋🍕 Confira seu pedido, por gentileza! 😊\n\n🍕 Quantidade de pizzas: ${receipt.pizzaCount}\n\n${lines.join("\n\n")}\n\n👤 ${c.name}\n\n🏠 ${c.zone === "retirada" ? "Retirada no local" : `Entrega: ${c.address}`}\n\n🚚 Taxa de entrega: ${money(fee)}\n\n💳 Pagamento: ${paymentLabel}${receipt.pix ? `\n\n🔑 PIX: ${receipt.pix.key}\n👤 Titular: ${receipt.pix.holder}` : ""}${c.payment === "dinheiro" ? `\n\n💵 Valor em dinheiro do cliente: ${money(c.cash || receipt.total)}\n🪙 Valor do troco a entregar: ${money(c.cash ? c.cash - receipt.total : 0)}` : ""}\n\n✅ *Total: ${money(receipt.total)}*\n\n🔎 Está tudo certo? Escreva OK para confirmar ou ALTERAR para mudar algo. 🙏🍕`;
}
export function advance(prev: Conversation, text: string, menu: Menu, fee: number, pix = defaultPix) {
  let c: Conversation = { ...prev, items: prev.items.map((i) => ({ ...i })) };
  const t = normalize(text.trim());
  let reply = "";
  let confirmed = false;
  const askReview = () => {
    c.step = "review";
    return summary(c, c.zone === "retirada" ? 0 : fee, pix);
  };
  const partial = () =>
    `\n\n💰 *Valor do pedido até agora: ${money(total(c.items, c.payment, c.zone === "retirada" ? 0 : fee))}*`;
  const offerMore = () =>
    `🍕😋 Deseja *acrescentar mais alguma pizza*? 🥤 E para beber, vai querer alguma bebida? Temos: ${menu.drinks.filter((drink) => drink.enabled).map((drink) => `${drink.name} ${money(drink.price)}`).join(", ") || "nenhuma bebida disponível no momento"}. 😊🙏` + partial();
  // Menu requests interrupt no order step, including payment and confirmation.
  if (/\b(cardapio|menu)\b/.test(t) && !/\b(nao|sem)\b/.test(t))
    return { c, reply: chatMenu(menu), confirmed: false };
  if (/^(oi|ola|opa|bom dia|boa tarde|boa noite)[!. ]*$/.test(t))
    return { c, reply: defaultWelcome + "\n\n" + chatMenu(menu), confirmed: false };
  if (c.step === "done") {
    if (/^(ok|obrigad|valeu)/.test(t))
      return {
        c,
        reply:
          "Por nada! 🍕 Este pedido é só uma demonstração. Para pedir de verdade, fale no WhatsApp.",
        confirmed: false,
      };
    c.step = "edit";
  }
  if (c.step === "review" && /^(ok|sim|confirmo|pode confirmar)[.! ]*$/.test(t)) {
    c.step = "done";
    return {
      c,
      reply:
        "✅ Pedido de teste confirmado! 🍕 Ele já aparece no painel de demonstração. Nenhum pedido foi enviado à pizzaria.",
      confirmed: true,
    };
  }
  if (/^(alterar|quero alterar)$/.test(t)) {
    c.step = "edit";
    return {
      c,
      reply:
        "✏️ O que deseja mudar? Pode trocar a entrega, o pagamento, remover uma pizza ou acrescentar um item.",
      confirmed: false,
    };
  }
  if ((c.step === "edit" || c.step === "review") && /entreg|retirada/.test(t)) {
    c.zone = t.includes("retirada") ? "retirada" : "entrega";
    c.step = c.zone === "retirada" ? "review" : "address";
    return {
      c,
      reply: c.zone === "retirada" ? askReview() : "📍 Qual é o endereço completo, com número?",
      confirmed: false,
    };
  }
  if (c.step === "phone") {
    const d = t.replace(/\D/g, "");
    if (d.length < 10) reply = "📞 Informe um telefone com DDD, por favor.";
    else {
      c.phone = d;
      c.step = "delivery";
      reply = "🏠🛵 O pedido será para *entrega* ou *retirada* no local? 🍕😊" + partial();
    }
  } else if (c.step === "name") {
    c.name = text.trim();
    c.step = "phone";
    reply = "📞🙏 Para registrar seu pedido, pode informar seu telefone com DDD, por gentileza? 🍕😊" + partial();
  } else if (c.step === "delivery") {
    if (/retirada|buscar/.test(t)) {
      c.zone = "retirada";
      c.address = "Retirada no local";
      c.step = "payment";
      reply = "💳 Como deseja pagar? PIX, débito, crédito ou dinheiro?" + partial();
    } else if (/entreg/.test(t)) {
      c.zone = "entrega";
      c.step = "address";
      reply = "📍 Envie seu endereço completo, com número e referência." + partial();
    } else reply = "🏠 Entrega ou retirada?";
  } else if (c.step === "address") {
    if (!/\d|sem numero/.test(t))
      reply = "📍 Falta o número da casa. Pode enviar o endereço completo?";
    else {
      c.address = text;
      c.step = c.name ? "payment" : "name";
      reply = c.name ? "💳 PIX, débito, crédito ou dinheiro?" + partial() : "👤 Qual é seu nome?";
    }
  } else if (
    c.step === "payment" ||
    ((c.step === "edit" || c.step === "review") && /pix|debito|credito|dinheiro/.test(t))
  ) {
    const p = ["pix", "debito", "credito", "dinheiro"].find((p) => t.includes(p));
    if (!p) reply = "💳 Escolha PIX, débito, crédito ou dinheiro.";
    else {
      c.payment = p;
      if (p === "dinheiro") {
        c.step = "cash";
        reply = "💵😊 *Troco para quanto?* (ou diga *sem troco*)" + partial();
      } else reply = askReview();
    }
  } else if (c.step === "cash") {
    const v = Number(t.replace(/[^\d,.]/g, "").replace(",", "."));
    if (/sem troco|exato|nao/.test(t)) {
      c.cash = 0;
      reply = askReview();
    } else if (v >= total(c.items, c.payment, c.zone === "retirada" ? 0 : fee)) {
      c.cash = v;
      reply = askReview();
    } else reply = "💵 Informe um valor que cubra o total do pedido." + partial();
  } else if ((c.step === "edit" || c.step === "review") && /remov|tirar/.test(t)) {
    const match = c.items.findIndex((i) => t.includes(normalize(i.name.replace(/^Pizza /, ""))));
    if (match >= 0) {
      c.items.splice(match, 1);
      reply = c.items.length ? askReview() : "🍕 Qual pizza deseja agora?";
      if (!c.items.length) c.step = "items";
    } else reply = "Qual item deseja remover? Escreva o nome completo, com tamanho.";
  } else if (/sem cebola|bem assada|sem milho|sem palmito|borda/.test(t) && c.items.length) {
    const last = c.items.at(-1);
    if (last) last.obs = text;
    reply = c.name
      ? askReview()
      : "📝 Observação anotada! Deseja mais alguma pizza ou bebida?" + partial();
  } else if (
    /^(nao|não|so isso|só isso|nenhuma|finalizar|continuar|sem bebida)[.! ]*$/.test(t) &&
    c.items.length
  ) {
    if (c.name) reply = askReview();
    else {
      c.step = "name";
      reply = "👤 Qual é seu nome?" + partial();
    }
  } else {
    const readSize = (message: string) => /\b(grande|g)\b/.test(message)
      ? "G"
      : /\b(media|m)\b/.test(message)
        ? "M"
        : /\b(pequena|p)\b/.test(message)
          ? "P"
          : "";
    const all = menu.categories.flatMap((c) => c.items);
    const hasFlavor = (message: string) => all.some((item) =>
      message.includes(normalize(item.name.replace(/^Pizza /, "").slice(0, -2))),
    );
    // Complete the missing detail without discarding the customer's earlier choice.
    let orderText = t;
    if (c.pendingPizza && (
      (readSize(t) && !hasFlavor(t)) ||
      (!readSize(t) && hasFlavor(t) && readSize(c.pendingPizza))
    )) orderText = `${c.pendingPizza} ${t}`;
    const size = readSize(orderText);
    let found: MenuItem[] = [];
    let rest = orderText;
    for (const item of all
      .filter((i) => i.name.endsWith(` ${size}`))
      .sort((a, b) => b.name.length - a.name.length)) {
      const key = normalize(item.name.replace(/^Pizza /, "").slice(0, -2));
      if (rest.includes(key)) {
        found.push(item);
        rest = rest.replace(key, "");
      }
    }
    const drink = menu.drinks.find(
      (d) =>
        t.includes(normalize(d.name)) ||
        (t.includes("coca") && d.id === (/1[,.]5/.test(t) ? "coca15" : "coca2")) ||
        t.includes(normalize(d.name.replace(/^(Refri |Suco )/, ""))),
    );
    const qty = Math.max(
      1,
      Math.min(50, Number(orderText.match(/\b(\d{1,2})\s*(?:x|pizza|[a-z])/)?.[1] || 1)),
    );
    if (drink) {
      if (!drink.enabled) reply = "Esse item está indisponível. Pode escolher outro?";
      else {
        c.items.push({ name: drink.name, price: drink.price, qty });
        reply = c.name
          ? askReview()
          : "🥤 Adicionado! Deseja mais algo? Ou diga “só isso”." + partial();
      }
    } else if (found.length) {
      delete c.pendingPizza;
      if (found.some((i) => i.enabled === false))
        reply = "Esse sabor está indisponível. Escolha outro, por favor.";
      else if (found.length === 2 && found[0] && found[1] && /meio|metade/.test(orderText)) {
        c.items.push({
          name: `Pizza ${size} meio a meio ${found.map((i) => i.name.replace(/^Pizza /, "").slice(0, -2)).join(" / ")}`,
          price: halfPrice(found[0].price, found[1].price),
          halves: found.map((item) => ({ name: item.name, price: item.price / 2 })),
          qty,
        });
        reply = c.name
          ? askReview()
          : offerMore();
      } else if (found.length > 1)
        reply =
          "Você quer uma pizza meio a meio ou duas pizzas inteiras? Envie “meio a meio” e os sabores com tamanho.";
      else if (found[0]) {
        c.items.push({ name: found[0].name, price: found[0].price, qty });
        reply = c.name
          ? askReview()
          : offerMore();
      }
    } else if (!size && hasFlavor(orderText)) {
      c.pendingPizza = orderText;
      reply = "🍕 Qual tamanho você deseja: P, M ou G?";
    } else if (size) {
      c.pendingPizza = orderText;
      reply = "🍕 Qual sabor de pizza você deseja?";
    }
    else
      reply =
        "🍕 Pode enviar o sabor completo e o tamanho? Exemplo: “1 Calabresa G”. Para conferir os sabores, digite “cardápio”.";
  }
  return { c, reply, confirmed };
}
