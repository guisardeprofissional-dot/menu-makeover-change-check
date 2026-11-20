import { botStep, confirmsOrder, transcribeAudio, GEMINI_DEFAULT_KEY, newBotState, normMenu, DEFAULT_CONFIG, STATUS_LABEL } from "./bot.js";
import { customerPhone } from "./order-details.js";

const DATA_KEY = "marmitex-prado-data";
const SESSIONS_KEY = "marmitex-prado-sessions";
const CONNECTION_KEY = "marmitex-prado-connection";
const PAUSED_KEY = "marmitex-prado-paused";

const initialData = () => ({ orders: [], config: { ...DEFAULT_CONFIG }, menu: normMenu(), seq: 1 });
const uid = () => Math.random().toString(36).slice(2, 10);

function cancelOrder(o, reason, at = Date.now()) {
	if (o.status === "cancelado") return o;
	return { ...o, status: "cancelado", cancelReason: reason, requests: o.requests.map((r) => (r.status === "pendente" ? { ...r, status: "aceita" } : r)), history: [...o.history, { at, text: `Cancelado: ${reason}` }] };
}

function reduceData(data, a) {
	const at = Date.now();
	if (a.type === "config") return { ...data, config: { ...data.config, ...a.config } };
	if (a.type === "menu") return { ...data, menu: normMenu(a.menu) };
	if (a.type === "clear-finished") return { ...data, orders: data.orders.filter((o) => !["entregue", "cancelado"].includes(o.status)) };
	if (a.type === "add") return data.orders.some((o) => o.id === a.order.id) ? data : { ...data, seq: data.seq + 1, orders: [{ ...a.order, number: data.seq }, ...data.orders].slice(0, 500) };
	return {
		...data,
		orders: data.orders.map((o) => {
			if (o.id !== a.id) return o;
			if (a.type === "cancel") return cancelOrder(o, a.reason || "cancelado pelo atendente");
			if (a.type === "status") return { ...o, status: a.status, history: [...o.history, { at, text: `Status: ${STATUS_LABEL[a.status]}` }] };
			if (a.type === "printed") return { ...o, printedAt: at };
			if (a.type === "update-seen") return { ...o, updateSeen: true };
			if (a.type === "request") return { ...o, requests: [...o.requests, { id: uid(), type: a.requestType, text: a.text, at, status: "pendente" }], history: [...o.history, { at, text: `Cliente pediu ${a.requestType}: ${a.text}` }] };
			if (a.type === "resolve") {
				const r = o.requests.find((x) => x.id === a.reqId);
				if (!r || r.status !== "pendente") return o;
				const next = { ...o, requests: o.requests.map((x) => (x.id === r.id ? { ...x, status: a.accept ? "aceita" : "recusada" } : x)) };
				return a.accept && r.type === "cancelamento" ? cancelOrder(next, `pedido do cliente: ${r.text}`) : next;
			}
			return o;
		}),
	};
}

const normalizeText = (v) => String(v || "").replace(/[\s*_~]+/g, "").toLowerCase().slice(0, 4000);
const alnum = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const idKey = (id) => String(id || "").split("_").pop();
function sendGuard(data, conv, messageId, text, now, msgT) {
	if (data.config.botEnabled === false) return { reason: "robô desativado", mark: true };
	if (messageId.startsWith("true_")) return { reason: "mensagem enviada por nós", mark: true };
	if (conv.seen.includes(messageId)) return { reason: "mensagem já processada", mark: false };
	/* Mesma mensagem com outro formato de id (c.us/lid): não processa de novo. */
	if (messageId.length > 12 && (conv.seen ?? []).some((x) => x.length > 12 && idKey(x) === idKey(messageId))) return { reason: "mensagem já processada", mark: true };
	/* Sequência: mensagem mais antiga do que a última já respondida nunca é processada. */
	if (msgT && conv.lastInT && msgT < conv.lastInT) return { reason: "mensagem antiga fora de ordem", mark: true };
	if (conv.outbox) return { reason: "resposta anterior ainda em envio", mark: false };
	const t = normalizeText(text);
	const isCommand = confirmsOrder(text) || /^(voltar|volta|anterior|cancelar|cancela|novo|oi|ola|olá|menu|\d{1,3})[.!]*$/.test(t);
	const ta = alnum(t);
	if (ta && !isCommand && (conv.botTexts ?? []).some((b0) => { const b = alnum(b0); return b && (b === ta || (ta.length >= 15 && b.includes(ta))); })) return { reason: "eco da própria resposta do robô", mark: true };
	if (!messageId.startsWith("false_") && t && (conv.recentIn ?? []).some((r) => r.t === t && now - r.at < 8e3)) return { reason: "mensagem duplicada", mark: true };
	return null;
}

async function prepareReply(data, conversation, chatId, messageId, text, t = 0, phone = "", cleared = false) {
	const prev = conversation ?? { state: newBotState(), seen: [] };
	const now = Date.now();
	// Retoma a mesma resposta que falhou, sem avançar o atendimento novamente.
	if (prev.outbox?.messageId === messageId && data.config.botEnabled !== false) {
		return { data, conversation: prev, reply: prev.outbox.text, messages: prev.outbox.messages || [prev.outbox.text].filter(Boolean), sentCount: prev.outbox.sentCount || 0, sendMenu: Boolean(prev.outbox.sendMenu) };
	}
	/* Conversa apagada no WhatsApp: recomeça do início (boas-vindas + cardápio). */
	if (cleared && prev.state?.history?.length && !prev.outbox) prev.state = newBotState();
	/* Cliente voltou em outro dia: recomeça e cumprimenta pelo nome. */
	else if (prev.lastAt && prev.state?.name && new Date(prev.lastAt).toDateString() !== new Date(now).toDateString() && !prev.outbox) prev.state = { ...newBotState(), name: prev.state.name, returning: true };
	if (prev.state && prev.state.step !== "inicio" && prev.state.step !== "feito" && now - (prev.lastAt ?? 0) > 18e5) prev.state = { ...newBotState(), name: prev.state.name };
	if (prev.state?.step === "feito" && now - (prev.lastAt ?? 0) > 6 * 36e5) prev.state = { ...newBotState(), name: prev.state.name };
	/* Resposta antiga travada: libera para atender a nova mensagem do cliente (sem reenviar a antiga). */
	if (prev.outbox && prev.outbox.messageId !== messageId && now - (prev.outbox.at ?? 0) > 9e4) prev.outbox = undefined;
	const guard = sendGuard(data, prev, messageId, text, now, t);
	const recentIn = [...(prev.recentIn ?? []), { t: normalizeText(text), at: now }].filter((r) => now - r.at < 6e4).slice(-30);
	if (guard) return { data, conversation: guard.mark ? { ...prev, seen: [...prev.seen, messageId].slice(-500), recentIn } : prev, reply: "", blocked: guard.reason };

	const result = await botStep(prev.state, text, data.config, data.menu, fetch, { phone: customerPhone(phone) || customerPhone(chatId) });
	/* IA fora do ar: guarda o aviso para o atendente ver no painel em vez de ficar sem saber. */
	data = { ...data, aiAlert: result.error ? { at: Date.now(), text: String(result.error).slice(0, 300) } : undefined };
	let state = result.state;
	if (result.createOrder) {
		const at = Date.now();
		const order = { ...result.createOrder, id: `wa:${chatId}:${messageId}`, customer: result.createOrder.name, phone: result.createOrder.phone, status: "novo", createdAt: at, history: [{ at, text: "Pedido recebido pelo WhatsApp" }], requests: [] };
		const number = data.seq;
		data = reduceData(data, { type: "add", order });
		state = { ...state, orderId: order.id };
		result.replies.push(`🔖 Seu número de pedido é *#${number}*.\n🍕🙏 Obrigado pela preferência! Já estamos cuidando do seu pedido. 😋📞`);
	}
	if (result.updateOrder) {
		const at = Date.now();
		const u = result.updateOrder.order;
		const old = data.orders.find((o) => o.id === result.updateOrder.id);
		if (old) {
			data = { ...data, orders: data.orders.map((o) => o.id !== old.id ? o : { ...o, ...u, id: o.id, number: o.number, customer: u.name || o.customer, phone: u.phone || o.phone, status: o.status, createdAt: o.createdAt, printedAt: undefined, updatedAt: at, updateSeen: false, history: [...(o.history || []), { at, text: result.updateOrder.draft ? "⚠️ Cliente ALTEROU o pedido (aguardando confirmação)" : "Pedido ATUALIZADO pelo cliente no WhatsApp" }], requests: o.requests || [] }) };
			if (!result.updateOrder.draft) result.replies.push(`✅ Seu pedido *#${old.number}* foi atualizado! 🍕🙏 Já estamos cuidando dele. 😋📞`);
		} else {
			const order = { ...u, id: `wa:${chatId}:${messageId}`, customer: u.name, phone: u.phone, status: "novo", createdAt: at, history: [{ at, text: "Pedido recebido pelo WhatsApp" }], requests: [] };
			const number = data.seq;
			data = reduceData(data, { type: "add", order });
			state = { ...state, orderId: order.id };
			result.replies.push(`🔖 Seu número de pedido é *#${number}*.\n🍕🙏 Obrigado pela preferência! Já estamos cuidando do seu pedido. 😋📞`);
		}
	}
	if (result.request && prev.state.orderId) data = reduceData(data, { type: "request", id: prev.state.orderId, requestType: result.request.type, text: result.request.text });
	const reply = result.replies.join("\n\n");
	const pixAt = result.state.pendingOrder?.payment === "pix" ? result.replies.findIndex((r, i) => i > 0 && /^[\d.\/-]{8,}$/.test(String(r).trim()) && (!data.config.pixKey || r === data.config.pixKey)) : -1;
	const separatePix = pixAt > 0;
	const messages = separatePix ? [result.replies.slice(0, pixAt).join("\n\n"), result.replies[pixAt], ...result.replies.slice(pixAt + 1)] : [reply].filter(Boolean);
	const recentOut = (prev.recentOut ?? []).filter((r) => now - r.at < 18e4);
	const key = normalizeText(reply);
	if (reply && (recentOut.filter((r) => r.t === key).length >= 2 || (prev.sentLog ?? []).filter((t) => now - t < 6e4).length >= 15)) {
		return { data, conversation: { ...prev, seen: [...prev.seen, messageId].slice(-500), lastAt: now, lastInT: Math.max(prev.lastInT || 0, t || 0) }, reply: "", blocked: "resposta repetida bloqueada para evitar loop" };
	}
	return {
		data,
		conversation: {
			state,
			lastInT: Math.max(prev.lastInT || 0, t || 0),
			seen: [...prev.seen, messageId].slice(-500),
			lastAt: now,
			recentIn,
			sentLog: [...(prev.sentLog ?? []), now].filter((t) => now - t < 6e4),
			recentOut: [...recentOut, { t: key, at: now }].slice(-20),
			botTexts: [...(prev.botTexts ?? []), ...result.replies.flatMap((r) => r.split("\n")).map(normalizeText).filter((x) => x.length >= 3)].slice(-150),
			outbox: reply || result.sendMenu ? { messageId, text: reply, messages, sentCount: 0, sendMenu: Boolean(result.sendMenu), at: now } : undefined,
		},
		reply,
		messages,
		sentCount: 0,
		sendMenu: Boolean(result.sendMenu),
	};
}

/* Ao instalar/atualizar, recarrega as abas do WhatsApp para o robô novo assumir
   (evita o erro "Extension context invalidated" e o robô parado). */
chrome.runtime.onInstalled.addListener(async () => {
	try {
		await chrome.storage.local.remove(CONNECTION_KEY);
		for (const tab of await chrome.tabs.query({ url: "https://web.whatsapp.com/*" })) if (tab.id !== undefined) chrome.tabs.reload(tab.id);
	} catch {}
});

/* Relógio do robô: a aba do WhatsApp em segundo plano tem os temporizadores congelados pelo
   Chrome, então a extensão manda um "tique" a cada 2s para ela verificar mensagens novas. */
chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== "marmitex-tick" || !port.sender?.url?.startsWith("https://web.whatsapp.com/")) return;
	const tabId = port.sender.tab?.id;
	if (tabId !== undefined) chrome.tabs.update(tabId, { autoDiscardable: false }).catch(() => {});
	const post = (m) => { try { port.postMessage(m); } catch {} };
	const iv = setInterval(() => post({ type: "tick" }), 2000);
	port.onMessage.addListener((m) => {
		if (m?.type === "sleep") setTimeout(() => post({ type: "wake", id: m.id }), Math.min(Math.max(Number(m.ms) || 0, 0), 1e4));
	});
	port.onDisconnect.addListener(() => clearInterval(iv));
});

chrome.action.onClicked.addListener(async () => {
	const [tab] = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
	if (tab?.id !== undefined) {
		await chrome.tabs.update(tab.id, { active: true });
		if (tab.windowId !== undefined) await chrome.windows.update(tab.windowId, { focused: true });
	} else await chrome.tabs.create({ url: "https://web.whatsapp.com/" });
});

async function trustedSend(tabId, point) {
	const target = { tabId };
	try { await chrome.debugger.attach(target, "1.3"); } catch (e) { if (!/already attached/i.test(String(e?.message ?? e))) throw new Error("Não foi possível ativar o envio automático: " + (e?.message ?? e)); }
	const cmd = (m, p) => chrome.debugger.sendCommand(target, m, p);
	try {
		if (point && Number.isFinite(point.x)) {
			const base = { x: point.x, y: point.y, button: "left", clickCount: 1 };
			await cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
			await cmd("Input.dispatchMouseEvent", { ...base, type: "mousePressed" });
			await cmd("Input.dispatchMouseEvent", { ...base, type: "mouseReleased" });
		} else {
			const key = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 };
			await cmd("Input.dispatchKeyEvent", { ...key, type: "keyDown", text: "\r", unmodifiedText: "\r" });
			await cmd("Input.dispatchKeyEvent", { ...key, type: "keyUp" });
		}
	} finally {
		await new Promise((r) => setTimeout(r, 150));
		try { await chrome.debugger.detach(target); } catch {}
	}
	return true;
}

const digits = (v) => String(v || "").replace(/\D/g, "").slice(-11);
/* A mesma conversa pode aparecer como @c.us, @lid ou com outro nome: confere id, número e nome. */
function isPaused(paused, chatId, name, phone) {
	if (paused[chatId]) return true;
	const user = String(chatId || "").split("@")[0];
	const ph = digits(phone) || (/@(c\.us|s\.whatsapp\.net)$/.test(chatId) ? digits(user) : "");
	const nm = String(name || "").trim();
	return Object.entries(paused).some(([id, p]) => id.split("@")[0] === user || (ph && ph.length >= 10 && (digits(p?.phone) === ph || (/@(c\.us|s\.whatsapp\.net)$/.test(id) && digits(id.split("@")[0]) === ph))) || (nm && String(p?.name || "").trim() === nm));
}
const CHAT_RE = /^[\w:+.-]+@(c\.us|s\.whatsapp\.net|lid)$/;

async function handle(message, sender) {
	const isPanel = sender.url?.startsWith(chrome.runtime.getURL(""));
	const isWhatsApp = sender.url?.startsWith("https://web.whatsapp.com/") && sender.tab?.id !== undefined;
	if (!isPanel && !isWhatsApp) throw new Error("Origem não autorizada.");
	const stored = await chrome.storage.local.get([DATA_KEY, SESSIONS_KEY, CONNECTION_KEY, PAUSED_KEY]);
	const paused = stored[PAUSED_KEY] ?? {};
	let data = stored[DATA_KEY] ?? initialData();
	data = { ...initialData(), ...data, config: { ...DEFAULT_CONFIG, ...data.config, pixKey: data.config?.pixKey || DEFAULT_CONFIG.pixKey, pixName: data.config?.pixName || DEFAULT_CONFIG.pixName }, menu: normMenu(data.menu) };
	if (!stored[DATA_KEY]) await chrome.storage.local.set({ [DATA_KEY]: data });

	if (message.type === "panel:get" && isPanel) return data;
	if (message.type === "panel:action" && isPanel) {
		data = reduceData(data, message.action);
		await chrome.storage.local.set({ [DATA_KEY]: data });
		return data;
	}
	if (message.type === "whatsapp:status" && isPanel) return stored[CONNECTION_KEY];
	if (message.type === "paused:list") return paused;
	if (message.type === "paused:set") {
		const id = String(message.chatId || "");
		if (!CHAT_RE.test(id)) throw new Error("Abra uma conversa primeiro.");
		if (message.paused) paused[id] = { at: Date.now(), name: String(message.name || "").slice(0, 100), phone: digits(message.phone) };
		else for (const k of Object.keys(paused)) if (isPaused({ [k]: paused[k] }, id, message.name, message.phone)) delete paused[k];
		await chrome.storage.local.set({ [PAUSED_KEY]: paused });
		return { paused: Boolean(paused[id]) };
	}
	if (!isWhatsApp) throw new Error("Operação não autorizada.");

	if (message.type === "whatsapp:heartbeat") {
		const prev = stored[CONNECTION_KEY];
		const ownerAlive = prev?.ownerTab !== undefined && Date.now() - (prev.ownerAt ?? 0) < 3e4;
		const ownerTab = ownerAlive && prev.ownerTab !== sender.tab.id ? prev.ownerTab : sender.tab.id;
		const isOwner = ownerTab === sender.tab.id;
		await chrome.storage.local.set({ [CONNECTION_KEY]: { ownerTab, ownerAt: isOwner ? Date.now() : prev.ownerAt, connected: Boolean(message.connected), chatOpen: Boolean(message.chatOpen), chatId: message.chatId, error: message.error, at: Date.now() } });
		return { enabled: data.config.botEnabled !== false && isOwner, paused: Boolean(message.chatId && isPaused(paused, message.chatId, message.name, message.phone)) };
	}
	/* Limite de tempo: se o Chrome travar o clique real (aba em segundo plano), não pode
	   travar a fila e deixar os outros clientes sem resposta. */
	if (message.type === "whatsapp:trusted-send") return Promise.race([trustedSend(sender.tab.id, message.point), new Promise((_, rej) => setTimeout(() => { chrome.debugger.detach({ tabId: sender.tab.id }).catch(() => {}); rej(new Error("clique real demorou demais")); }, 5000))]);

	const { chatId, messageId } = message;
	if (typeof chatId !== "string" || !CHAT_RE.test(chatId) || typeof messageId !== "string" || messageId.length > 500) throw new Error("Conversa inválida.");
	const sessions = stored[SESSIONS_KEY] ?? {};
	const conn = stored[CONNECTION_KEY];
	const otherOwner = conn?.ownerTab !== undefined && conn.ownerTab !== sender.tab.id && Date.now() - (conn.ownerAt ?? 0) < 3e4;
	if (message.type === "whatsapp:authorize-send") {
		const s = sessions[chatId];
		return { ok: !otherOwner && !isPaused(paused, chatId, message.name, message.phone) && data.config.botEnabled !== false && s?.outbox?.messageId === messageId };
	}
	if (message.type === "audio:transcribe" && isWhatsApp) {
		if (typeof message.data !== "string" || !message.data || message.data.length > 2e7) return "";
		return transcribeAudio(String(data.config.geminiKey || GEMINI_DEFAULT_KEY).trim(), message.data, String(message.mime || "audio/ogg"), fetch);
	}
	if (message.type === "whatsapp:incoming") {
		if (typeof message.text !== "string" || !message.text.trim() || message.text.length > 1e4) throw new Error("Mensagem inválida.");
		if (isPaused(paused, chatId, message.name, message.phone)) return { text: "", blocked: "robô pausado nesta conversa" };
		if (otherOwner) return { text: "", blocked: "outra aba do WhatsApp está respondendo" };
		const result = await prepareReply(data, sessions[chatId], chatId, messageId, message.text, Number(message.t) || 0, customerPhone(message.phone), Boolean(message.cleared));
		sessions[chatId] = result.conversation;
		await chrome.storage.local.set({ [DATA_KEY]: result.data, [SESSIONS_KEY]: sessions });
		return { text: result.reply, messages: result.messages || [], sentCount: result.sentCount || 0, sendMenu: Boolean(result.sendMenu), blocked: result.blocked };
	}
	if (message.type === "whatsapp:sent-part") {
		const outbox = sessions[chatId]?.outbox;
		if (outbox?.messageId === messageId && Number.isInteger(message.index) && message.index === (outbox.sentCount || 0)) {
			outbox.sentCount = message.index + 1;
			await chrome.storage.local.set({ [SESSIONS_KEY]: sessions });
		}
		return true;
	}
	if (message.type === "whatsapp:sent") {
		if (sessions[chatId]?.outbox?.messageId === messageId) {
			sessions[chatId] = { ...sessions[chatId], outbox: undefined, recentIn: [] };
			await chrome.storage.local.set({ [SESSIONS_KEY]: sessions });
		}
		return true;
	}
	throw new Error("Operação desconhecida.");
}

let queue = Promise.resolve();
chrome.runtime.onMessage.addListener((message, sender, reply) => {
	const work = queue.then(() => handle(message, sender));
	queue = work.catch(() => undefined);
	work.then((value) => reply({ ok: true, value })).catch((e) => reply({ ok: false, error: e instanceof Error ? e.message : "Falha na extensão." }));
	return true;
});
