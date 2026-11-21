// Absolluto Pizzaria — atendimento por IA (sem dependência do Chrome; testável).
import { customerPhone, deliveryReady, LOCATION_REQUEST, locationLink } from "./order-details.js";
export const BUSINESS = {
	name: "Absolluto Pizzaria",
	slogan: "Sabor que você sente, qualidade que você confia!",
	address: "Rua Paranaíba - Setor Bueno, Damianópolis-GO",
	owner: "",
	phone: "5562999396556",
	phoneLabel: "(62) 9.9939-6556",
};

export const MAX_PROTEINS = 200;
export const AI_TOKEN = "campeiro-atendente-2026";
/* Endereço do site publicado onde a IA roda. Serve de padrão para quem instala a extensão
   sem configurar nada, e de reserva quando o campo fica em branco. */
export const AI_DEFAULT_URL = "https://crave-to-cart-companion.lovable.app";

export const GEMINI_DEFAULT_KEY = "AQ.Ab8RN6LioywV8dRg66obIIrInQJsqGzlW5WbDAEj27TWo86XzA";
/* Primeira mensagem da conversa: boas-vindas + cardápio em PDF, enviados juntos. */
export const DEFAULT_WELCOME = "Boa noite! 🤠🍕 Seja muito bem-vindo à Absolluto Pizzaria! Sabor que você sente, qualidade que você confia! 😋 Segue abaixo nosso cardápio: 📋🍕";
export const WELCOME = DEFAULT_WELCOME;
export const DEFAULT_CONFIG = {
	botEnabled: true,
	open: true,
	welcomeMessage: DEFAULT_WELCOME,
	closedMessage: "🚪🌙 No momento estamos *fechados*. 🙏 Assim que abrirmos, é só mandar um *oi*! 🍕😋",
	pixKey: "43366274000101",
	pixName: "Edivanilson Apóstolo de Araújo",
	ruralFee: 0,
	aiUrl: AI_DEFAULT_URL,
	geminiKey: GEMINI_DEFAULT_KEY,
};

const L = (cat, rows) => ({ name: cat, items: rows.map(([name, price, desc = ""]) => ({ name, price, desc })) });
export const DEFAULT_MENU = {
	categories: [
		L("Pizzas Salgadas (P, M e G)", [["Pizza Moda da Casa P", 40, "molho, mussarela, presunto, atum, calabresa, bacon, palmito, tomate, cebola, orégano, azeitona, catupiry"], ["Pizza Moda da Casa M", 48, "…"], ["Pizza Moda da Casa G", 56, "…"], ["Pizza Cuiabana P", 45, "molho de tomate, mussarela, carne seca, banana frita, queijo coalho, pimenta biquinho, cebola, cream cheese, orégano, azeitona"], ["Pizza Cuiabana M", 50, "…"], ["Pizza Cuiabana G", 65, "…"], ["Pizza Peruana P", 45, "molho de tomate, mussarela, frango desfiado, presunto, lombo canadense, calabresa, palmito, catupiry alto poró, cebola, mel, orégano, azeitona"], ["Pizza Peruana M", 50, "…"], ["Pizza Peruana G", 65, "…"], ["Pizza Vegetariana P", 40, "molho de tomate, mussarela, palmito, pimentão, milho, ervilha, tomate, catupiry, cebola, orégano, azeitona"], ["Pizza Vegetariana M", 45, "…"], ["Pizza Vegetariana G", 50, "…"], ["Pizza Calabresa P", 40, "molho de tomate, mussarela, calabresa, catupiry, cebola, orégano, azeitona"], ["Pizza Calabresa M", 46, "…"], ["Pizza Calabresa G", 56, "…"], ["Pizza Bacon P", 38, "molho de tomate, mussarela, bacon, tomate, cebola, orégano, azeitona"], ["Pizza Bacon M", 43, "…"], ["Pizza Bacon G", 52, "…"], ["Pizza Bacon/Cheddar P", 39, "molho de tomate, mussarela, bacon, tomate, cebola, orégano, azeitona, cheddar"], ["Pizza Bacon/Cheddar M", 44, "…"], ["Pizza Bacon/Cheddar G", 53, "…"], ["Pizza Mexicana P", 40, "molho de tomate, mussarela, calabresa ralada, pimenta calabresa, tomate, cebola, orégano e azeitona"], ["Pizza Mexicana M", 45, "…"], ["Pizza Mexicana G", 54, "…"], ["Pizza Napolitana P", 36, "molho de tomate, mussarela, pimentão, tomate, palmito, cebola, orégano, azeitona"], ["Pizza Napolitana M", 38, "…"], ["Pizza Napolitana G", 48, "…"], ["Pizza Quatro Queijos P", 34, "molho de tomate, mussarela, queijo parmesão, catupiry, cheddar, orégano, azeitona"], ["Pizza Quatro Queijos M", 40, "…"], ["Pizza Quatro Queijos G", 48, "…"], ["Pizza Portuguesa P", 38, "molho de tomate, mussarela, presunto, pimentão, ovo, ervilha, quatro queijo, cebola, orégano, azeitona"], ["Pizza Portuguesa M", 45, "…"], ["Pizza Portuguesa G", 56, "…"], ["Pizza Margarita P", 35, "molho de tomate, mussarela, parmesão, tomate, orégano, azeitona"], ["Pizza Margarita M", 38, "…"], ["Pizza Margarita G", 48, "…"], ["Pizza Atum P", 38, "molho de tomate, mussarela, atum, milho, cebola, orégano, azeitona"], ["Pizza Atum M", 40, "…"], ["Pizza Atum G", 50, "…"], ["Pizza Carne Seca/Catupiry P", 40, "molho de tomate, mussarela, carne seca, catupiry, cream cheese, cebola, orégano, azeitona, pimenta biquinho"], ["Pizza Carne Seca/Catupiry M", 46, "…"], ["Pizza Carne Seca/Catupiry G", 60, "…"], ["Pizza Carne Seca/Especial P", 42, "molho de tomate, mussarela, carne seca, bacon, quatro queijo, cream cheese, queijo coalho, cebola, orégano, azeitona, pimenta biquinho"], ["Pizza Carne Seca/Especial M", 48, "…"], ["Pizza Carne Seca/Especial G", 65, "…"], ["Pizza Frango/Catupiry P", 38, "molho de tomate, mussarela, frango, catupiry, milho, cebola, orégano, azeitona"], ["Pizza Frango/Catupiry M", 45, "…"], ["Pizza Frango/Catupiry G", 52, "…"], ["Pizza Frango/Cheddar P", 39, "molho de tomate, mussarela, frango, milho, cebola, orégano, azeitona, cheddar"], ["Pizza Frango/Cheddar M", 46, "…"], ["Pizza Frango/Cheddar G", 53, "…"], ["Pizza Frango/Especial P", 42, "molho de tomate, mussarela, presunto, frango, bacon, milho, quatro queijo, cebola, orégano e azeitona"], ["Pizza Frango/Especial M", 48, "…"], ["Pizza Frango/Especial G", 58, "…"], ["Pizza Strogonofe P", 36, "molho de tomate, mussarela, frango, creme de leite, batata palha, orégano, azeitona"], ["Pizza Strogonofe M", 45, "…"], ["Pizza Strogonofe G", 53, "…"], ["Pizza Lombo P", 40, "molho de tomate, mussarela, lombo, bacon, tomate, quatro queijo, cebola, orégano, azeitona"], ["Pizza Lombo M", 50, "…"], ["Pizza Lombo G", 60, "…"]]),
		L("Pizzas Doces (P, M e G)", [["Pizza Banana P", 38, "mussarela, banana, leite condensado, creme de leite e canela"], ["Pizza Banana M", 40, "…"], ["Pizza Banana G", 50, "…"], ["Pizza Chocolate P", 36, "mussarela, chocolate ao leite e chocolate branco"], ["Pizza Chocolate M", 45, "…"], ["Pizza Chocolate G", 50, "…"], ["Pizza Sonho de Valsa P", 38, "mussarela, chocolate ao leite e bombom sonho de valsa"], ["Pizza Sonho de Valsa M", 45, "…"], ["Pizza Sonho de Valsa G", 54, "…"]]),
	],
	drinks: [
		{ id: "suco1l", name: "Suco 1L Maracujá", price: 15, enabled: true },
		{ id: "coca2", name: "Refri 2L Coca", price: 13, enabled: true },
		{ id: "coca15", name: "Refri 1,5L Coca", price: 11, enabled: true },
		{ id: "fanta2", name: "Refri 2L Fanta", price: 11, enabled: true },
		{ id: "guarana2", name: "Refri 2L Guaraná", price: 11, enabled: true },
	],
	notes: "Absolluto Pizzaria. Funcionamento: de terça-feira a domingo, das 18h30 às 22h30 (fechado às segundas). Tamanhos P, M e G. Pizza meio a meio: 2 sabores; cada metade custa METADE do preço daquele sabor no tamanho escolhido e o valor da pizza é a soma das duas metades. Todas as pizzas existem nos tamanhos P, M e G. Se o cliente pedir só “carne seca” sem dizer qual, pergunte se é Carne Seca/Catupiry ou Carne Seca/Especial antes de anotar. Endereço: Rua Paranaíba - Setor Bueno, Damianópolis-GO. WhatsApp: (62) 9.9939-6556. Instagram: @absollutobg.",
};

export const PAY_LABEL = { pix: "PIX", credito: "Cartão de crédito", debito: "Cartão de débito", dinheiro: "Dinheiro", cartao: "Cartão" };
export const ZONE_LABEL = { cidade: "Entrega", entrega: "Entrega", rural: "Zona rural", retirada: "Retirada no local" };
export const STATUS_LABEL = { novo: "Novo", cozinha: "Na cozinha", saiu: "Saiu p/ entrega", entregue: "Entregue", cancelado: "Cancelado" };

export const brl = (n) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
/* Compara textos ignorando o tipo de espaço (o pt-BR usa espaço inseparável no "R$"). */
const normTxt = (s) => String(s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
const num0 = (v, d = 0) => { if (v === undefined || v === null || String(v).trim() === "") return d; const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : d; };

export function normMenu(m) {
	const d = DEFAULT_MENU;
	if (!m || typeof m !== "object" || !Array.isArray(m.categories)) return JSON.parse(JSON.stringify(d));
	const categories = m.categories.map((c) => ({ name: String(c?.name ?? "").trim(), items: (Array.isArray(c?.items) ? c.items : []).filter((i) => String(i?.name ?? "").trim()).map((i) => ({ name: String(i.name).trim(), price: num0(i.price), desc: String(i.desc ?? "").trim(), enabled: i.enabled !== false })) })).filter((c) => c.name && c.items.length);
	const drinks = (Array.isArray(m.drinks) ? m.drinks : d.drinks).filter((x) => x && String(x.name ?? "").trim()).map((x, i) => ({ id: String(x.id || "d" + i), name: String(x.name).trim(), price: num0(x.price), enabled: x.enabled !== false }));
	return { categories, drinks, notes: String(m.notes ?? "") };
}

/* Texto do cardápio usado no editor (um item por linha). */
export function menuToText(menu) {
	return menu.categories.map((c) => [`# ${c.name}`, ...c.items.map((i) => `${i.name} | ${String(i.price).replace(".", ",")}${i.desc ? ` | ${i.desc}` : ""}`)].join("\n")).join("\n\n");
}
export function textToCategories(text) {
	const cats = [];
	for (const line of String(text ?? "").split("\n").map((l) => l.trim()).filter(Boolean)) {
		if (line.startsWith("#")) { cats.push({ name: line.replace(/^#+/, "").trim(), items: [] }); continue; }
		const [name, price, ...desc] = line.split("|").map((x) => x.trim());
		if (!cats.length) cats.push({ name: "Cardápio", items: [] });
		cats.at(-1).items.push({ name, price: num0(price), desc: desc.join(" | ") });
	}
	return cats;
}

export function menuForCustomer(menu) {
	const out = ["📋🍕 *Cardápio Absolluto Pizzaria* 🤠😋", ""];
	for (const c of menu.categories) {
		out.push(`*🍕 ${c.name.toUpperCase()}*`, ...c.items.map((i) => `• ${i.name} — ${brl(i.price)}${i.desc && !i.desc.startsWith("…") ? `\n   _${i.desc}_` : ""}`), "");
	}
	const dr = menu.drinks.filter((d) => d.enabled);
	if (dr.length) out.push("*🥤 BEBIDAS 🥤*", ...dr.map((d) => `• ${d.name} — ${brl(d.price)}`));
	return out.join("\n").trim();
}

export const deliveryFee = (zone, c) => (zone === "retirada" ? 0 : num0(c?.ruralFee, 0));
export const itemLabel = (it) => it.name || "Pizza — sabor não informado";
export const itemsTotal = (items) => (items ?? []).reduce((a, i) => a + i.unit * i.qty, 0);
export const drinksTotal = (list) => (list ?? []).reduce((a, d) => a + d.price * d.qty, 0);
export const CARD_FEE = { debito: 2, credito: 2.5 };
export const cardFee = (o) => CARD_FEE[o?.payment] ?? 0;
export const orderTotal = (o, c) => itemsTotal(o.items) + drinksTotal(o.drinks) + (o.deliveryFee ?? deliveryFee(o.zone, c)) + cardFee(o);

export const newBotState = () => ({ step: "inicio", name: "", history: [] });

// Confirmation belongs to the extension, never to the model's interpretation.
export const PIX_CONFIRM = "✅ Digite *OK* para confirmar o seu pedido agora, ou se quiser alterar é só me dizer o que precisa alterar. 🙏🍕";
export const confirmsOrder = (text) => /^(?:confirmo(?: o pedido)?|confirmar(?: o pedido)?|sim|sim pode confirmar|pode confirmar|esta certo|tudo certo|correto|ok+|okay|oky|ok ok|ta ok|esta ok|pode ser|isso|isso mesmo|fechado|ok pode confirmar)[.!\s]*$/.test(norm(text));

/** Capture explicit, sized pizza requests before the AI can forget an earlier message. */
export function requestedPizzas(text, menu) {
	const input = norm(text);
	const parts = input.split(/\b(?:mais|tambem|e outra|e uma|e 1|e duas)\b/);
	const result = [];
	for (const part of parts) {
		const size = /\b(grande|g)\b/.test(part) ? "G" : /\b(media|m)\b/.test(part) ? "M" : /\b(pequena|p)\b/.test(part) ? "P" : "";
		if (!size) continue;
		const opts = menu.categories.flatMap((c) => c.items).filter((i) => i.name.endsWith(` ${size}`)).map((i) => ({ ...i, key: flavorKey(i.name.slice(0, -2)) })).sort((a, b) => b.key.length - a.key.length);
		let rest = ` ${part} `;
		const found = [];
		for (const item of opts) {
			if (!rest.includes(` ${item.key} `)) continue;
			found.push(item);
			rest = rest.replace(` ${item.key} `, " | ");
		}
		const qty = Number(String(text).match(/(?:^|\s)(\d{1,2})\s/)?.[1] || (/\bduas\b/.test(part) ? 2 : 1));
		if (found.length === 2 && /metade|meio a meio/.test(part)) {
			result.push({ name: `Pizza ${size} meio a meio ${found.map((i) => i.name.slice(6, -2)).join("/")}`, qty, unit: (found[0].price + found[1].price) / 2 });
		} else if (found.length === 1 && !/metade|meio a meio/.test(part)) result.push({ name: found[0].name, qty, unit: found[0].price });
	}
	return result;
}

export function reviewOrder(order, config) {
	const count = order.items.reduce((total, item) => total + item.qty, 0);
	return ["📋🍕 Confira seu pedido, por gentileza! 😊", `🍕 Quantidade de pizzas: *${count}*`, ...order.items.map((i) => `🍕 ${i.qty}x ${i.name} — ${brl(i.unit * i.qty)}${i.obs ? `\n   ${i.obs}` : ""}`), ...order.drinks.map((d) => `🥤 ${d.qty}x ${d.name} — ${brl(d.price * d.qty)}`), `👤 ${order.name}`, `🏠 ${ZONE_LABEL[order.zone]}: ${order.address}`, `🚚 Taxa de entrega: ${brl(order.deliveryFee)}`, `💳 Pagamento: ${PAY_LABEL[order.payment]}`, ...(order.changeFor ? [`💵 Valor em dinheiro do cliente: ${brl(order.changeFor)}`, `🪙 Valor do troco a entregar: ${brl(order.changeFor - orderTotal(order, config))}`] : []), ...(cardFee(order) ? [`💳 Acréscimo ${PAY_LABEL[order.payment].toLowerCase()}: ${brl(cardFee(order))} (já incluído no total)`] : []), `✅ Total: *${brl(orderTotal(order, config))}*`, "🔎 Está tudo certo? Escreva *OK* para confirmar ou *ALTERAR* para mudar algo. 🙏🍕", ...(order.payment === "pix" ? [`📋 Chave PIX (CNPJ) enviada na próxima mensagem — é só segurar nela e tocar em *Copiar*. 👇`, `👤 Titular: ${config.pixName}`] : [])].join("\n\n");
}

const norm = (t) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const PAYS = ["pix", "credito", "debito", "dinheiro", "cartao"];

const HALF_RE = /meio\s*a\s*meio/i;
const flavorKey = (t) => norm(String(t ?? "").replace(/^pizza\s+/i, "")).replace(/\s+/g, " ").trim();

/**
 * Preço de uma pizza meio a meio calculado a partir do cardápio: cada metade
 * custa metade do preço daquele sabor no tamanho escolhido.
 * Retorna { unit, label } ou null quando não dá para calcular (tamanho ou sabores não reconhecidos).
 */
export function halfHalfPrice(menu, name) {
	const raw = String(name ?? "");
	if (!HALF_RE.test(raw)) return null;
	const m = menu && Array.isArray(menu.categories) && menu.categories.length ? menu : DEFAULT_MENU;
	const size = (raw.match(/(?:^|[^a-z0-9])([pmg])(?:[^a-z0-9]|$)/i)?.[1] || "").toUpperCase();
	if (!size) return null;
	const options = [];
	for (const c of m.categories) {
		for (const i of c.items ?? []) {
			const mm = String(i.name ?? "").match(/^(.*?)\s+([pmg])$/i);
			if (!mm || mm[2].toUpperCase() !== size) continue;
			const key = flavorKey(mm[1]);
			if (!key) continue;
			options.push({ key, label: `${mm[1].replace(/^pizza\s+/i, "").trim()} ${size}`, price: num0(i.price) });
		}
	}
	options.sort((a, b) => b.key.length - a.key.length);
	let text = ` ${flavorKey(raw.replace(HALF_RE, " "))} `;
	const found = [];
	for (const o of options) {
		if (found.length >= 2) break;
		const at = text.indexOf(` ${o.key}`);
		if (at < 0) continue;
		found.push(o);
		text = `${text.slice(0, at)} | ${text.slice(at + o.key.length)}`;
	}
	if (found.length < 2 || found[0].key === found[1].key) return null;
	const [a, b] = found;
	const unit = Math.round((a.price / 2 + b.price / 2) * 100) / 100;
	return { unit, label: `½ ${a.label} ${brl(a.price / 2)} + ½ ${b.label} ${brl(b.price / 2)} = ${brl(unit)}` };
}

/** Converte o pedido devolvido pela IA no formato de pedido do painel. */
export function buildOrder(raw, c, menu) {
	const items = (raw?.items ?? []).map((i) => ({ name: String(i.name ?? "").slice(0, 120), qty: Math.max(1, Math.min(50, Math.round(num0(i.qty, 1)))), unit: num0(i.unit), obs: String(i.obs ?? "").slice(0, 300) })).filter((i) => i.name);
	/* Pizza meio a meio: o preço vem do cardápio (metade do valor de cada sabor),
	   não do que a IA escreveu — assim o valor nunca sai errado. */
	for (const it of items) {
		const h = halfHalfPrice(menu, it.name);
		if (!h) continue;
		it.unit = h.unit;
		/* Junta a observação da IA com o detalhe das metades SEM repetir: a IA costuma
		   escrever o mesmo detalhe com espaço comum (o cardápio usa espaço inseparável),
		   então a comparação ignora o tipo de espaço e trechos idênticos entram uma vez só. */
		const seen = new Set();
		it.obs = [it.obs, h.label]
			.filter(Boolean)
			.flatMap((s) => s.split(" | "))
			.filter((s) => {
				const k = normTxt(s);
				if (!k || seen.has(k)) return false;
				seen.add(k);
				return true;
			})
			.join(" | ")
			.slice(0, 300);
	}
	const drinks = (raw?.drinks ?? []).map((d, k) => ({ id: "ai" + k, name: String(d.name ?? "").slice(0, 80), qty: Math.max(1, Math.round(num0(d.qty, 1))), price: num0(d.price) })).filter((d) => d.name);
	if (!items.length && !drinks.length) return null;
	const zone = raw?.zone === "retirada" ? "retirada" : raw?.zone === "entrega" ? "entrega" : null;
	const realName = String(raw?.name || "").trim();
	const rawPay = String(raw?.payment ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
	const payment = PAYS.includes(rawPay) ? rawPay : null;
	const changeAsked = raw?.changeFor !== undefined && raw?.changeFor !== null && raw?.changeFor !== "";
	const changeFor = payment === "dinheiro" && num0(raw?.changeFor) > 0 ? num0(raw.changeFor) : undefined;
	const link = locationLink(raw?.location?.lat, raw?.location?.lng);
	return { name: (realName && !/^cliente$/i.test(realName) ? realName : "").slice(0, 60), phone: customerPhone(raw?.phone), items, drinks, zone, address: String(link || raw?.address || (zone === "retirada" ? "Retirada no local" : "")).slice(0, 300), payment, changeFor, changeAsked, deliveryFee: deliveryFee(zone || "entrega", c) };
}

const GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest"];
/* Transcreve o áudio do cliente (WhatsApp) para texto usando a mesma IA. */
export async function transcribeAudio(key, data, mime, fetchImpl = fetch) {
	const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Transcreva fielmente este áudio em português do Brasil (pedido de pizzaria). Responda SOMENTE com o texto falado, sem comentários. Se não houver fala, responda vazio." }, { inline_data: { mime_type: mime || "audio/ogg", data } }] }], generationConfig: { temperature: 0 } });
	for (let round = 0; round < 3; round++) {
		if (round) await new Promise((ok) => setTimeout(ok, 1500 * round));
		for (const model of GEMINI_MODELS) {
			try {
				const r = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body });
				const out = await r.json().catch(() => ({}));
				const txt = (out?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text || "").join("").trim();
				if (r.ok) return txt;
				if (r.status === 401 || r.status === 403) return "";
			} catch {}
		}
	}
	return "";
}
async function askGemini(key, ctx, history, fetchImpl) {
	const sys = `Você é o atendente virtual da ${ctx.business.name} (${ctx.business.slogan}) no WhatsApp. Responda em português do Brasil, curto, simpático e com BASTANTE emojis: use de 3 a 6 emojis em cada mensagem, sempre combinando com o assunto (🍕😋🤠📋🏠📞💳✅🙏⏳🥤). Nunca mande mensagem seca, sem emoji. Use SOMENTE o cardápio abaixo e seus preços. Taxa de entrega: R$ ${ctx.business.deliveryFee}. PIX: ${ctx.business.pix || "não informado"}.
Colete: itens (com observações), bebidas, nome, entrega ou retirada, endereço (se entrega), forma de pagamento (pix, credito, debito, dinheiro) e troco. PAGAMENTO É OBRIGATÓRIO: SEMPRE pergunte a forma de pagamento ao cliente; NUNCA presuma, NUNCA use "dinheiro" ou outra forma por conta própria. Enquanto o cliente não disser a forma de pagamento, deixe "payment" vazio (""). Se for dinheiro, pergunte EXATAMENTE de forma curta: "💵 Troco para quanto?" (nunca use frases longas como "você precisa de troco para quanto em dinheiro"): changeFor = valor do troco, ou 0 se não precisar; deixe null enquanto não souber. Se o cliente só disser "sim" para o troco, NÃO aceite: pergunte o VALOR (troco para quanto) e insista até ele informar o valor. NOME e ENTREGA/RETIRADA também são obrigatórios: pergunte sempre, nunca presuma; deixe "name" e "zone" vazios até o cliente responder. REGRAS DA PIZZA MEIO A MEIO: o cliente pode escolher 2 sabores na mesma pizza, em qualquer tamanho disponível para os DOIS sabores (P, M ou G). SEMPRE pergunte o tamanho se o cliente não disser; nunca escolha o tamanho sozinho. CADA METADE custa METADE do preço daquele sabor no tamanho escolhido, e o valor da pizza é a soma das duas metades. Ex.: Calabresa G R$ 56,00 → metade R$ 28,00; Cuiabana G R$ 65,00 → metade R$ 32,50; pizza = R$ 60,50. No resumo mostre cada metade com a sua metade de preço e o valor final. No "order" use um único item com name "Pizza G meio a meio Calabresa/Cuiabana" e unit = valor final.
CÁLCULO: confira a soma do total item por item antes de mostrar (itens + bebidas + taxa de entrega + acréscimo do cartão). CARTÃO: débito tem acréscimo de R$ 2,00 e crédito de R$ 2,50; ao cliente escolher cartão, avise esse acréscimo. PIX e dinheiro não têm acréscimo.
ENTREGA: peça primeiro: ${LOCATION_REQUEST} Aceite localização enviada pelo WhatsApp ou link do Google Maps e preserve o link em address. Com localização válida, não exija endereço escrito ou número. Só quando o cliente realmente não conseguir enviar localização, aceite rua, NÚMERO da casa, bairro e ponto de referência; pergunte os dados que faltarem. Se não houver número, aceite "sem número" com referência.
TELEFONE: número identificado no WhatsApp: ${ctx.phone || "indisponível"}. Use esse número em phone; se indisponível, peça um telefone com DDD e use somente o informado pelo cliente. Nunca invente telefone ou use identificador @lid. CUPOM: cada item deve conter Pizza, tamanho e sabor completo; em meio a meio, os dois sabores.
MEIO A MEIO: entenda como pizza MEIO A MEIO (dois sabores na mesma pizza): "calabresa/moda da casa", "calabre/moda", "calabresa e frango na mesma", "calabresa metade frango", "metade calabresa metade frango", "meia calabresa meia frango", "1/2 calabresa 1/2 frango". Aceite erros de digitação e abreviações dos sabores ("calabre"=Calabresa, "frago"/"frang"=Frango, "4 queijo"=Quatro Queijos) comparando com o cardápio. Se o cliente citar dois sabores e NÃO ficar claro se é uma pizza meio a meio ou duas pizzas inteiras, PERGUNTE: "É uma pizza meio a meio (metade X e metade Y) ou duas pizzas inteiras?". Se citar um sabor só e houver qualquer dúvida, pergunte se a pizza será inteira daquele sabor.
CONDUZA O CLIENTE: toda resposta sua deve terminar com uma pergunta ou instrução clara do próximo passo (ex.: tamanho, bebida, nome, entrega, pagamento). Nunca diga "confira o resumo" sem que o pedido esteja completo; quando todos os dados estiverem coletados, gere o "order" para o resumo aparecer. NA DÚVIDA, PERGUNTE: nunca adivinhe. Se a mensagem do cliente puder ter dois sentidos (acrescentar ou trocar uma pizza, "retirar" = tirar do pedido ou retirada no local, sabor que não existe, sabor escrito errado, tamanho faltando), pergunte de forma clara e espere a resposta antes de mudar o pedido. Ex.: "Você quer trocar a Cuiabana P por meio a meio Carne Seca/Cuiabana P, ou acrescentar mais uma?". "1 p carne/cuiabana" ou "carne seca e cuiabana" na mesma pizza = UMA pizza meio a meio; se não tiver certeza, confirme. Quando o cliente corrigir/descrever melhor uma pizza que já está no pedido ("a pizza P é metade X e metade Y"), é CORREÇÃO daquela pizza: substitua, não acrescente. Quando pedir para tirar/remover uma pizza, remova-a do pedido. "order.items" deve SEMPRE conter a lista COMPLETA e ATUAL de pizzas (nem a mais, nem a menos). Nunca coloque o mesmo texto de observação repetido.
VALOR A QUALQUER MOMENTO: se o cliente perguntar "quanto ficou", "qual o valor", "quanto deu", "total" etc., em QUALQUER momento, responda NA HORA com o valor de cada item e o total parcial até agora (itens + bebidas + taxa de entrega se já souber), e depois continue de onde parou. Nunca ignore essa pergunta.
OFERTA: depois que o cliente disser as pizzas, SEMPRE pergunte se deseja *acrescentar mais alguma pizza* e SEMPRE ofereça bebidas, citando as bebidas disponíveis do cardápio com preço. Faça isso antes de pedir nome, endereço e pagamento.
PEDIDO ACUMULADO: uma nova pizza é ADICIONADA às anteriores, nunca substituída, salvo quando o cliente pedir alteração ou remoção. Exemplo: "1 calabresa grande", depois "1 grande metade cuiabana e metade lombo" = DUAS pizzas (Calabresa G R$ 56,00 + meio a meio Cuiabana/Lombo G R$ 62,50). Com suco R$ 15,00, total R$ 133,50. Preserve todos os itens mesmo em mensagens separadas. Se houver dúvida entre acrescentar ou trocar, pergunte antes de resumir.
Quando todos os dados estiverem coletados, preencha "order" como RASCUNHO completo para a extensão apresentar a conferência. Não agradeça pelo pedido, não informe número, não diga que já está sendo preparado. A extensão só finaliza após confirmação do resumo. Se o cliente disser ALTERAR, pergunte o que muda, aplique a alteração e gere outro rascunho para nova conferência. PIX: NUNCA escreva a chave PIX, o titular ou frases como "segue a chave PIX" no reply — a extensão envia a chave sozinha em mensagem separada para o cliente copiar.
Responda APENAS com JSON: {"reply": string, "sendMenu": boolean (true se o cliente pedir o cardápio), "order": null ou {"name","phone","items":[{"name","qty","unit","obs"}],"drinks":[{"name","qty","price"}],"zone":"entrega"|"retirada","address","payment","changeFor"}}
CARDÁPIO:
${ctx.menu}
OBSERVAÇÕES: ${ctx.notes || ""}
ÚLTIMO PEDIDO DO CLIENTE: ${ctx.lastOrder ? JSON.stringify(ctx.lastOrder) : "nenhum"}`;
	const body = JSON.stringify({
		systemInstruction: { parts: [{ text: sys }] },
		contents: history.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
		generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
	});
	let j, lastErr;
	/* Insiste antes de desistir: a IA às vezes fica sobrecarregada por alguns segundos. */
	outer: for (let round = 0; round < 4; round++) {
		if (round) await new Promise((ok) => setTimeout(ok, 2000 * round));
		for (const model of GEMINI_MODELS) {
			let r, out;
			try {
				r = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body });
				out = await r.json().catch(() => ({}));
			} catch (e) { lastErr = String(e?.message ?? e); continue; }
			if (r.ok && out?.candidates?.[0]?.content) { j = out; break outer; }
			lastErr = out?.error?.message || "Gemini HTTP " + r.status;
			if (r.status === 400 || r.status === 401 || r.status === 403) break outer;
		}
	}
	if (!j) throw new Error(lastErr);
	const txt = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "{}";
	return parseAi(txt);
}

/** Um passo da conversa (IA). Retorna { state, replies, createOrder?, request? }. */
/* Lê a resposta da IA mesmo quando vem com texto extra ou JSON quebrado; nunca manda código ao cliente. */
export function parseAi(txt) {
	const t = String(txt ?? "").replace(/```(?:json)?/gi, "").trim();
	const tryParse = (v) => { try { const o = JSON.parse(v); return o && typeof o === "object" ? o : null; } catch { return null; } };
	let o = tryParse(t);
	if (!o) { const a = t.indexOf("{"), b = t.lastIndexOf("}"); if (a >= 0 && b > a) o = tryParse(t.slice(a, b + 1)); }
	if (o) {
		if (typeof o.reply === "string" && /^\s*\{[\s\S]*"reply"/.test(o.reply)) { const inner = parseAi(o.reply); return { ...o, ...inner }; }
		return o;
	}
	const m = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
	if (m) { try { return { reply: JSON.parse(`"${m[1]}"`) }; } catch { return { reply: m[1].replace(/\\n/g, "\n") }; } }
	if (/^\s*[\[{]|"(sendMenu|order)"\s*:/.test(t)) return { reply: "" };
	return { reply: t };
}

// A failed AI request must not leave the customer waiting for a reply that will never arrive.
// Only explicit catalog choices and answers to the current question are recovered locally.
function recoverConversation(s, input, menu, phone) {
	const text = norm(input);
	const draft = s.draftOrder || s.lastOrder;
	const order = draft ? JSON.parse(JSON.stringify(draft)) : { name: "", phone: "", items: [], drinks: [], zone: "", address: "", payment: "" };
	order.phone = phone || order.phone;
	const result = (reply, extra = {}) => ({ reply, order: order.items.length || order.drinks.length ? order : null, ...extra });
	const question = (reply, pendingPizza = s.pendingPizza) => ({ reply, recoveryQuestion: true, pendingPizza });
	if (/\b(troca|trocar|tira|tirar|remove|remover|altera|alterar|cancela|cancelar)\b/.test(text) || s.editing || s.amendOrderId)
		return question("⚠️ A IA está indisponível para interpretar essa alteração. Seu pedido foi preservado; aguarde o atendente para ajustar com segurança. 🙏🍕");
	switch (s.recoveryStep) {
		case "phone": {
			const value = customerPhone(input);
			if (!value) return question("📞 Informe seu telefone com DDD, por gentileza. 🙏🍕");
			order.phone = value;
			return result("");
		}
		case "name":
			if (input.trim().length < 2 || /\d/.test(input)) return question("👤 Qual é seu nome, por gentileza? 😊🙏");
			order.name = input.trim();
			return result("");
		case "delivery":
			if (/\b(retirada|buscar)\b/.test(text)) { order.zone = "retirada"; order.address = "Retirada no local"; }
			else if (/\b(entrega|entregar)\b/.test(text)) order.zone = "entrega";
			else return question("🏠 O pedido será para entrega ou retirada no local? 🍕😊");
			return result("");
		case "address":
			if (!deliveryReady(input)) return question(LOCATION_REQUEST);
			order.address = input;
			return result("");
		case "payment": {
			const payment = PAYS.find((p) => new RegExp(`\\b${p}\\b`).test(text));
			if (!payment || payment === "cartao") return question("💳 Escolha PIX, débito, crédito ou dinheiro. 😊🙏");
			order.payment = payment;
			return result("");
		}
		case "cash": {
			if (/sem troco|exato|^nao$/.test(text)) { order.changeFor = 0; return result(""); }
			const match = input.match(/^\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*$/i);
			if (!match) return question("💵 Troco para quanto? Informe o valor ou diga sem troco. 😊🙏");
			order.changeFor = Number(match[1].replace(",", "."));
			return result("");
		}
	}
	const readSize = (v) => /\b(grande|g)\b/.test(norm(v)) ? "G" : /\b(media|m)\b/.test(norm(v)) ? "M" : /\b(pequena|p)\b/.test(norm(v)) ? "P" : "";
	const flavors = [...new Set(menu.categories.flatMap((category) => category.items).map((item) => flavorKey(item.name.slice(0, -2))))];
	const hasFlavor = (v) => flavors.some((flavor) => ` ${norm(v)} `.includes(` ${flavor} `));
	const pending = s.pendingPizza || (!draft && readSize(input) && !hasFlavor(input) ? [...s.history].reverse().find((message) => message.role === "user" && hasFlavor(message.content) && !readSize(message.content))?.content : "");
	const combined = pending && ((readSize(input) && !hasFlavor(input)) || (!readSize(input) && hasFlavor(input) && readSize(pending))) ? `${pending} ${input}` : input;
	if (hasFlavor(combined)) {
		if (!readSize(combined)) return question("🍕 Qual tamanho da pizza você deseja: P, M ou G? 😊🙏", combined);
		const pizzas = requestedPizzas(combined, menu);
		if (!pizzas.length) return question("🍕 É uma pizza meio a meio ou pizzas inteiras? Informe os sabores e o tamanho, por gentileza. 😊🙏", combined);
		order.items.push(...pizzas);
		return result("", { pendingPizza: null });
	}
	if (readSize(combined)) return question("🍕 Qual sabor você deseja nesse tamanho? 😊🙏", combined);
	const drink = menu.drinks.find((d) => d.enabled && (text === norm(d.name) || text === norm(d.name.replace(/^(Refri |Suco )/, ""))));
	if (drink) { order.drinks.push({ ...drink, qty: 1 }); return result(""); }
	if (order.items.length && /^(nao|so isso|finalizar|continuar|sem bebida)$/.test(text)) return result("");
	return question("⚠️ A IA está temporariamente indisponível. Para continuar, informe o sabor do cardápio e o tamanho P, M ou G. 🍕🙏");
}

export async function botStep(state, raw, c, menu, fetchImpl = fetch, contact = {}) {
	c = { ...DEFAULT_CONFIG, ...c };
	c.pixKey = c.pixKey || DEFAULT_CONFIG.pixKey;
	c.pixName = c.pixName || DEFAULT_CONFIG.pixName;
	let s = { ...newBotState(), ...state };
	const firstName = String(s.name || "").trim().split(/\s+/)[0];
	const WELCOME = (s.returning && firstName ? `😊💛 Que bom te ver por aqui de novo, *${firstName}*!\n\n` : "") + ((c.welcomeMessage || "").trim() || DEFAULT_WELCOME);
	s.returning = false;
	menu = normMenu(menu);
	menu = { ...menu, categories: menu.categories.map((c) => ({ ...c, items: c.items.filter((i) => i.enabled !== false) })).filter((c) => c.items.length) };
	if (!Array.isArray(s.history)) s.history = [];
	const input = String(raw ?? "").trim().slice(0, 1500);
	const cmd = norm(input).replace(/^[^\n:]{1,30}:\s*/, "").trim();
	if (/\b(cardapio|menu)\b/.test(cmd) && !/\b(nao|sem)\b/.test(cmd)) return { state: { ...s, history: [...s.history, { role: "user", content: input }, { role: "assistant", content: "(cardápio PDF enviado)" }].slice(-16) }, replies: s.history.length ? [] : [WELCOME], sendMenu: true };

	if (s.step === "feito") {
		if (/cancel|desist/.test(cmd)) return { state: s, replies: ["🛑 Recebemos seu pedido de cancelamento. 🙏 Um atendente vai confirmar em instantes. 📞"], request: { type: "cancelamento", text: input } };
		/* Pedido já confirmado: qualquer outra mensagem (acrescentar, trocar, tirar, mudar endereço/pagamento) vira atualização do mesmo pedido. */
		s = { ...newBotState(), step: "conversa", name: s.name, lastOrder: s.lastOrder, orderId: s.orderId, amendOrderId: s.orderId, history: s.history ?? [], pizzaItems: (s.lastOrder?.items ?? []).map((i) => ({ ...i })), upsellAsked: true };
	}
	if (c.open === false) return { state: s, replies: [c.closedMessage || DEFAULT_CONFIG.closedMessage] };
	/* Primeira mensagem da conversa: junta boas-vindas + cardápio PDF à resposta. */
	const isFirst = s.history.length === 0;
	if (s.pendingOrder && confirmsOrder(input) && !s.editing) {
		const order = s.pendingOrder;
		const done = { ...newBotState(), step: "feito", name: order.name, lastOrder: order, orderId: s.amendOrderId || s.orderId, history: s.history };
		return s.amendOrderId ? { state: done, replies: [], updateOrder: { id: s.amendOrderId, order } } : { state: done, replies: [], createOrder: order };
	}
	/* Saudação simples na 1ª mensagem: responde só com as boas-vindas + cardápio, sem chamar a IA (evita saudação duplicada). */
	if (isFirst && !/\d/.test(input)) {
		const rest = cmd.replace(/\b(oi|ola|opa|eai|ei|hey|hello|bom|boa|dia|tarde|noite|tudo|bem|joia|blz|beleza|por favor|pf|pv|porfavor)\b/g, "").replace(/[^a-z0-9]/g, "");
		if (rest.length < 3) return { state: { ...s, history: [{ role: "user", content: input }, { role: "assistant", content: WELCOME }] }, replies: [WELCOME], sendMenu: true };
	}
	const lastBot = [...s.history].reverse().find((h) => h.role === "assistant")?.content || "";
	if ((s.pendingOrder || /ALTERAR/.test(lastBot)) && /\balter(ar|acao|e)\b/.test(cmd)) {
		s = { ...s, pendingOrder: undefined, editing: true };
		const rest = cmd.replace(/\b(quero|gostaria|de|eu|o|a|pedido|alterar|alteracao|altere|sim|por favor|pf)\b/g, "").replace(/[^a-z0-9]/g, "");
		if (rest.length < 3) {
			const ask = "✏️🍕 Claro! O que deseja alterar no pedido? Informe a pizza, quantidade ou outro detalhe. 😊🙏";
			return { state: { ...s, history: [...s.history, { role: "user", content: input }, { role: "assistant", content: ask }] }, replies: [ask] };
		}
	}
	/* A IA monta a lista completa a cada mensagem; o código não soma pizzas por conta própria. */
	s = { ...s, pendingOrder: undefined, pizzaItems: s.pizzaItems ?? [] };
	const base = String(c.aiUrl || AI_DEFAULT_URL).trim().replace(/\/+$/, "");
	if (!base && !String(c.geminiKey || GEMINI_DEFAULT_KEY).trim()) return { state: s, replies: s.warned ? [] : ["Olá! 👋😄 Já vou te responder, só um instante! 🙏🍕"], ...(s.warned ? {} : { state: { ...s, warned: true } }) };

	const history = [...s.history, { role: "user", content: input }].slice(-16);
	let res, aiError;
	try {
		const gkey = String(c.geminiKey || GEMINI_DEFAULT_KEY).trim();
		if (gkey) {
		const ctx = { business: { name: BUSINESS.name, slogan: BUSINESS.slogan, deliveryFee: deliveryFee("entrega", c), pix: c.pixKey ? `${c.pixKey}${c.pixName ? ` (${c.pixName})` : ""}` : "" }, menu: menuForCustomer(menu), notes: `${menu.notes}
${LOCATION_REQUEST}
Pizzas já solicitadas (preserve todas, salvo alteração explícita): ${JSON.stringify(s.pizzaItems ?? [])}
${s.amendOrderId ? `ATUALIZAÇÃO DE PEDIDO JÁ CONFIRMADO: o cliente já fechou este pedido (lastOrder) e agora quer mudar algo (acrescentar pizza/bebida, trocar, tirar, mudar endereço ou pagamento). SEMPRE responda e atenda. Gere "order" COMPLETO e atualizado = pedido anterior + a mudança, mantendo nome, entrega/endereço e pagamento do lastOrder, salvo se o cliente mudar. Na dúvida, pergunte.\n` : ""}Telefone do cliente: ${customerPhone(contact.phone) || "não identificado; solicitar DDD e telefone"}${isFirst ? "\nAs boas-vindas e o cardápio já foram enviados pela extensão; NÃO cumprimente nem dê boas-vindas novamente, responda direto ao pedido." : ""}`, phone: customerPhone(contact.phone), lastOrder: s.draftOrder ?? s.lastOrder ?? null };
		res = await askGemini(gkey, ctx, history, fetchImpl);
		if (!res.order && /confira|confirmar|confirmação|pedido atualizado|pedido.*prepar|número de pedido/i.test(String(res.reply || ""))) {
			res = await askGemini(gkey, ctx, [...history, { role: "user", content: 'Retorne o JSON com order estruturado COMPLETO e ATUALIZADO aplicando todas as alterações desta conversa. Não finalize e não invente dados; se faltar informação, pergunte sem mostrar conferência nem pedir OK.' }], fetchImpl);
		}
		}
		else {
		const r = await fetchImpl(base + "/api/public/atendente", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: AI_TOKEN, business: { name: BUSINESS.name, slogan: BUSINESS.slogan, deliveryFee: deliveryFee("entrega", c), pix: c.pixKey ? `${c.pixKey}${c.pixName ? ` (${c.pixName})` : ""}` : "" }, menu: menuForCustomer(menu), notes: `${menu.notes}
${LOCATION_REQUEST}
Pizzas já solicitadas (preserve todas, salvo alteração explícita): ${JSON.stringify(s.pizzaItems ?? [])}.${s.amendOrderId ? " ATUALIZAÇÃO DE PEDIDO JÁ CONFIRMADO (lastOrder): o cliente quer mudar algo; sempre responda e gere order COMPLETO = pedido anterior + mudança." : ""} Gere order como rascunho para conferência; nunca finalize por conta própria.
Telefone do cliente: ${customerPhone(contact.phone) || "não identificado; solicitar DDD e telefone"}${isFirst ? "\nAs boas-vindas e o cardápio já foram enviados pela extensão; NÃO cumprimente nem dê boas-vindas novamente, responda direto ao pedido." : ""}`, phone: customerPhone(contact.phone), lastOrder: s.lastOrder ?? null, history }),
		});
		res = await r.json().catch(() => ({}));
		if (!r.ok) throw new Error(res?.error || "HTTP " + r.status);
		}
	} catch (e) {
		aiError = String(e?.message ?? e);
		res = recoverConversation(s, input, menu, customerPhone(contact.phone));
	}
	if (!res.order && (!String(res.reply || "").trim() || /s[oó] um instante|estou conferindo.*j[aá].*respondo/i.test(String(res.reply))))
		res = recoverConversation(s, input, menu, customerPhone(contact.phone));
	if (res.recoveryQuestion) {
		return { state: { ...s, step: "conversa", pendingPizza: res.pendingPizza, history: [...history, { role: "assistant", content: res.reply }] }, replies: [...(isFirst ? [WELCOME] : []), res.reply], ...(aiError ? { error: aiError } : {}), ...(isFirst ? { sendMenu: true } : {}) };
	}
	let reply = String(res.reply ?? "").trim();
	/* Na 1ª mensagem as boas-vindas já cumprimentam: remove saudação genérica da IA. */
	if (isFirst) reply = reply.replace(/^\s*(ol[áa]|oi|boa (noite|tarde)|bom dia)[^.!?\n]*[.!?]+\s*/i, "").replace(/^\s*como posso (te |lhe )?ajud[^?\n]*\?+[^\S\n]*[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D\s]*/iu, "").trim();
	/* A chave PIX vai sozinha em mensagem separada: remove qualquer menção a ela do texto da IA. */
	if (c.pixKey) {
		const key = c.pixKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		reply = reply
			.split("\n")
			.filter((l) => !new RegExp(key, "i").test(l) && !/chave\s*pix|pix\s*(para|p\/)\s*pagamento|titular/i.test(l))
			.join("\n")
			.replace(/\n{3,}/g, "\n\n")
			.trim();
	}
	const replies = [];
	if (res.sendMenu) return { state: { ...s, step: "conversa", history: [...history, { role: "assistant", content: "(cardápio PDF enviado)" }].slice(-16) }, replies: isFirst ? [WELCOME] : [], sendMenu: true };
	if (reply) replies.push(reply);
	if (isFirst) replies.unshift(WELCOME);
	const next = { ...s, warned: false, step: "conversa", history: [...history, { role: "assistant", content: reply || "(cardápio enviado)" }].slice(-16), ...(res.pendingPizza === null ? { pendingPizza: undefined } : {}) };
	let rawOrder = res.order;
	const order = rawOrder ? buildOrder({ ...rawOrder, phone: customerPhone(contact.phone) || rawOrder.phone }, c, menu) : null;
	if (order) {
		next.draftOrder = order;
		if (aiError || res.pendingPizza === null) next.pizzaItems = order.items.map((item) => ({ ...item }));
	}
	const diagnostic = aiError ? { error: aiError } : {};
	// Never ask for OK unless a structured, validated draft is actually saved.
	if (!order && /confira|confirmar|confirmação|pedido atualizado|pedido.*prepar|número de pedido/i.test(reply)) {
		const ask = "⏳🍕 Estou conferindo as alterações do seu pedido. Pode repetir a última alteração, por gentileza? 🙏😊";
		return { state: { ...next, editing: true, history: [...history, { role: "assistant", content: ask }].slice(-16) }, replies: [ask] };
	}
	if (order && !order.phone) {
		const ask = "📞🙏 Para registrar seu pedido, pode informar seu telefone com DDD, por gentileza? 🍕😊";
		return { state: { ...next, recoveryStep: "phone", history: [...history, { role: "assistant", content: ask }].slice(-16) }, replies: [...replies.filter((r) => r !== reply), ask], ...diagnostic, ...(isFirst ? { sendMenu: true } : {}) };
	}
	const runTotal = order && ((order.items ?? []).length || (order.drinks ?? []).length) ? `\n\n💰 *Valor do pedido até agora: ${brl(orderTotal(order, c))}*` : "";
	const askFor = (ask0, recoveryStep = "items") => { const ask = /total/i.test(ask0) ? ask0 : ask0 + runTotal; return { state: { ...next, recoveryStep, history: [...history, { role: "assistant", content: ask }].slice(-16) }, replies: [...replies.filter((r) => r !== reply), ask], ...diagnostic, ...(isFirst ? { sendMenu: true } : {}) }; };
	if (order && !s.upsellAsked && !(order.drinks ?? []).length) {
		const r0 = askFor(`🍕😋 Deseja *acrescentar mais alguma pizza*? 🥤 E para beber, vai querer alguma bebida? Temos: ${(menu.drinks ?? []).filter((d) => d.enabled).map((d) => `${d.name} ${brl(d.price)}`).join(", ") || "veja no cardápio"}. 😊🙏`);
		r0.state.upsellAsked = true;
		return r0;
	}
	if (order && !order.name) return askFor("👤😊 Para registrar o pedido, qual é o seu nome, por gentileza? 🍕🙏", "name");
	if (order && !order.zone) return askFor("🏠🛵 O pedido será para *entrega* ou *retirada* no local? 🍕😊", "delivery");
	/* Pizza sumiu do pedido sem o cliente pedir para tirar/trocar: confirma antes. */
	const prevItems = s.pizzaItems ?? [];
	const asksChange = /\b(tira|tirar|retira|retirar|remove|remover|exclui|excluir|cancela|cancelar|troca|trocar|muda|mudar|altera|alterar|substitui|substituir|no lugar|ao inves|ao invés|em vez|errado|errei|corrig)/i.test(input);
	const answeredSwap = /trocar\*? .*acrescentar\*?/i.test(lastBot);
	if (order && prevItems.length && !asksChange && !answeredSwap) {
		const lost = prevItems.filter((p) => !order.items.some((i) => norm(i.name) === norm(p.name)));
		if (lost.length) return askFor(`🤔🍕 Só para eu não errar: você quer *trocar* ${lost.map((p) => `a ${p.name}`).join(", ")} pelo que acabou de pedir, ou quer *acrescentar* mais uma pizza? 😊🙏`);
	}
	if (aiError && order && order.zone === "entrega" && !deliveryReady(order.address)) {
		return askFor(LOCATION_REQUEST, "address");
	}
	if (order && order.payment === "dinheiro") {
		const total = orderTotal(order, c);
		const userMsgs = history.filter((m) => m.role === "user").slice(-3).map((m) => norm(m.content));
		const noChange = userMsgs.some((t) => /(sem troco|nao (precis|quero|vou precisar)|nao$|^nao\b|troco nao|nao preciso|valor (certo|exato)|tenho trocado|dinheiro (certo|trocado)|nenhum)/.test(t));
		const v = num0(order.changeFor);
		if (v > 0 && v < total) { order.changeFor = undefined; return askFor(`💵🤔 O total do pedido é *${brl(total)}*. 💵 *Troco para quanto?*`, "cash"); }
		if (!(v > 0) && !noChange) return askFor(`💵😊 O total é *${brl(total)}*. 💵 *Troco para quanto?* (ou diga *sem troco*)`, "cash");
		if (!(v > 0)) order.changeFor = undefined;
	}
	if (order && !order.payment) {
		return askFor("💳😊 Qual será a forma de pagamento, por gentileza? *PIX*, *Cartão de crédito*, *Cartão de débito* ou *Dinheiro*? 🍕🙏", "payment");
	}
	if (order && order.zone === "entrega" && !deliveryReady(order.address)) {
		return askFor(LOCATION_REQUEST, "address");
	}
	if (order) {
		const review = reviewOrder(order, c);
		if (s.amendOrderId) return { state: { ...next, editing: false, pizzaItems: order.items.map((i) => ({ ...i })), pendingOrder: order, history: [...history, { role: "assistant", content: review }].slice(-16) }, replies: [review, ...(order.payment === "pix" && c.pixKey ? [c.pixKey, PIX_CONFIRM] : [])], updateOrder: { id: s.amendOrderId, order, draft: true } };
		return { state: { ...next, recoveryStep: "review", editing: false, pizzaItems: order.items.map((i) => ({ ...i })), pendingOrder: order, history: [...history, { role: "assistant", content: review }].slice(-16) }, replies: [...(isFirst ? [WELCOME] : []), review, ...(order.payment === "pix" && c.pixKey ? [c.pixKey, PIX_CONFIRM] : [])], ...diagnostic, ...(isFirst ? { sendMenu: true } : {}) };
	}
	/* Nunca fica calado: se a IA não respondeu nada, pede para o cliente repetir. */
	if (!replies.length) {
		const ask = "🤔🙏 Desculpe, não entendi direitinho. Pode me explicar de novo, por gentileza? 🍕😊";
		return { state: { ...next, history: [...history, { role: "assistant", content: ask }].slice(-16) }, replies: [ask], ...(isFirst ? { sendMenu: true } : {}) };
	}
	return { state: next, replies, ...(isFirst ? { sendMenu: true } : {}) };
}
