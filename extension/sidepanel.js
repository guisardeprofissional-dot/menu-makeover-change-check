import { brl, itemLabel, PAY_LABEL, ZONE_LABEL, STATUS_LABEL, BUSINESS, botStep, newBotState, menuToText, textToCategories, AI_DEFAULT_URL, DEFAULT_CONFIG } from "./bot.js";
import { formatPhone } from "./order-details.js";

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
let data = null;
let filter = "ativos";
let period = "hoje";
let selId = null;
let knownUpd = new Map();
let knownIds = null;
let sim = newBotState();
const PREFS_KEY = "marmitex-prado-prefs";
let menuDirty = false;
let prefs = { autoPrint: false, paper: "80", fontSize: "12" };

async function req(message) {
	const r = await chrome.runtime.sendMessage(message);
	if (!r?.ok) throw new Error(r?.error || "Falha na extensão");
	return r.value;
}
const act = async (action) => { data = await req({ type: "panel:action", action }); render(); };

const cardFeeOf = (o) => ({ debito: 2, credito: 2.5 })[o.payment] ?? 0;
const orderTotal = (o) => o.items.reduce((a, i) => a + i.unit * i.qty, 0) + (o.drinks ?? []).reduce((a, d) => a + d.price * d.qty, 0) + (o.deliveryFee ?? 0) + cardFeeOf(o);
const fmtPhone = formatPhone;
const ago = (t) => { const m = Math.max(0, Math.round((Date.now() - t) / 6e4)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`; };
const isToday = (t) => new Date(t).toDateString() === new Date().toDateString();
const active = (o) => !["entregue", "cancelado"].includes(o.status);
const NEXT = { novo: ["cozinha", "👩‍🍳 Mandar p/ cozinha"], cozinha: ["saiu", "🛵 Saiu p/ entrega"], saiu: ["entregue", "✅ Entregue"] };
const PREV = { cozinha: ["novo", "Novo"], saiu: ["cozinha", "Na cozinha"], entregue: ["saiu", "Saiu p/ entrega"] };
const badge = (s) => `<span class="badge ${s}">${STATUS_LABEL[s]}</span>`;
const pending = (o) => (o.requests ?? []).filter((r) => r.status === "pendente");
const short = (o) => o.items.map((i) => `${i.qty}x ${i.name ?? (i.carnes ?? []).join(" + ")}`).join(", ");

function beep() {
	try {
		const ctx = new AudioContext();
		[0, 0.25, 0.5].forEach((d) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.25, ctx.currentTime + d); o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.15); });
	} catch {}
}

function ticketBody(o) {
	const items = o.items.map((i) => `<div class="tr"><span>${i.qty}x ${esc(itemLabel(i))}</span><span>${brl(i.unit * i.qty)}</span></div>${i.obs ? `<div>&nbsp;&nbsp;Obs: ${esc(i.obs)}</div>` : ""}`).join("");
	const drinks = (o.drinks ?? []).length ? o.drinks.map((d) => `<div class="tr"><span>&nbsp;&nbsp;${d.qty}x ${esc(d.name)}</span><span>${brl(d.price * d.qty)}</span></div>`).join("") : "<div>&nbsp;&nbsp;Nenhum refrigerante</div>";
	const sub = orderTotal(o) - (o.deliveryFee ?? 0) - cardFeeOf(o);
	return `<div class="tc tt">${esc(BUSINESS.name)}</div><div class="tc">${esc(BUSINESS.address)}</div><div class="tc">WhatsApp ${esc(BUSINESS.phoneLabel)}</div><hr>
<div class="tr"><b>PEDIDO #${o.number}</b><b>${STATUS_LABEL[o.status]}</b></div><div>${new Date(o.createdAt).toLocaleString("pt-BR")}</div><hr>
<div><b>Cliente:</b> ${esc(o.customer)}</div><div><b>Fone:</b> ${esc(fmtPhone(o.phone))}</div><div><b>Entrega:</b> ${esc(ZONE_LABEL[o.zone] || "")} — ${esc(o.address)}</div><hr>
${items}<div><b>Bebidas:</b></div>${drinks}${o.sides?.length ? `<div><b>Acompanhamentos:</b> ${esc(o.sides.join(", "))}</div>` : ""}<hr>
<div class="tr"><span>Subtotal</span><span>${brl(sub)}</span></div><div class="tr"><span>Taxa de entrega</span><span>${o.deliveryFee ? brl(o.deliveryFee) : "GRÁTIS"}</span></div>
${cardFeeOf(o) ? `<div class="tr"><span>Acréscimo cartão</span><span>${brl(cardFeeOf(o))}</span></div>` : ""}<div class="tr tt"><span>TOTAL</span><span>${brl(orderTotal(o))}</span></div>
<div><b>Pagamento:</b> ${esc(PAY_LABEL[o.payment] || o.payment)}</div>${o.payment === "pix" ? `<div>PIX CNPJ: ${esc(data?.config?.pixKey || DEFAULT_CONFIG.pixKey)}</div><div>Titular: ${esc(data?.config?.pixName || DEFAULT_CONFIG.pixName)}</div><div>Conferir comprovante PIX</div>` : ""}${o.changeFor ? `<div><b>Total do pedido:</b> ${brl(orderTotal(o))}</div><div><b>Valor em dinheiro do cliente:</b> ${brl(o.changeFor)}</div><div><b>Valor do troco a entregar:</b> ${brl(o.changeFor - orderTotal(o))}</div>` : ""}<hr>
<div class="tc">${esc(BUSINESS.slogan)} Obrigado pela preferência.</div>`;
}
function printOrder(o) {
	if (!o) return;
	const w = prefs.paper === "58" ? "54mm" : "76mm";
	const fs = Number(prefs.fontSize) || 12;
	const win = window.open("", "_blank", "width=420,height=640");
	if (!win) return alert("Permita pop-ups para imprimir.");
	win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Pedido #${o.number}</title><style>@page{size:${w} auto;margin:2mm}body{width:${w};margin:0;font:${fs}px/1.35 "Courier New",monospace;color:#000;overflow-wrap:anywhere}.tc{text-align:center}.tr{display:flex;justify-content:space-between;gap:6px}.tt{font-weight:bold;font-size:${fs + 2}px}hr{border:0;border-top:1px dashed #000;margin:5px 0}</style></head><body>${o.updatedAt ? `<div class="tc tt">*** PEDIDO ALTERADO ***</div><hr>` : ""}${ticketBody(o)}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);
	win.document.close();
	act({ type: "printed", id: o.id });
}

function renderPainel() {
	const all = data.orders;
	const today = all.filter((o) => isToday(o.createdAt));
	const valid = today.filter((o) => o.status !== "cancelado");
	const cnt = (s) => all.filter((o) => o.status === s).length;
	$("dash").innerHTML = `<div class="stat"><span>Novos</span><b>${cnt("novo")}</b><small>aguardando cozinha</small></div><div class="stat"><span>Na cozinha</span><b>${cnt("cozinha")}</b></div><div class="stat"><span>Saíram p/ entrega</span><b>${cnt("saiu")}</b></div><div class="stat"><span>Vendas hoje</span><b>${brl(valid.reduce((a, o) => a + orderTotal(o), 0))}</b><small>${valid.length} pedidos · ${today.length - valid.length} cancelados</small></div>`;
	const reqs = all.flatMap((o) => pending(o).map((r) => ({ o, r })));
	$("pending").innerHTML = reqs.length ? reqs.map(({ o, r }) => `<div class="preq"><b>#${o.number} ${esc(o.customer)}</b><span>${r.type === "cancelamento" ? "Cancelar" : "Alterar"}: ${esc(r.text)}</span><button class="btn sm green" data-resolve="${o.id}|${r.id}|1">Aceitar</button><button class="btn sm" data-resolve="${o.id}|${r.id}|0">Recusar</button></div>`).join("") : `<p class="muted small">Nenhuma solicitação.</p>`;
	const q = all.filter(active);
	$("queue").innerHTML = q.length ? q.map((o) => `<div class="qrow" data-open="${o.id}"><span class="n">#${o.number}</span><span class="nm">${esc(o.customer)}</span>${badge(o.status)}<span>${ago(o.createdAt)}</span></div>`).join("") : `<p class="muted small">Nenhum pedido em andamento.</p>`;
}

function renderPedidos() {
	const all = data.orders;
	const F = { ativos: ["Em andamento", active], novo: ["Novos", (o) => o.status === "novo"], cozinha: ["Cozinha", (o) => o.status === "cozinha"], saiu: ["Saiu", (o) => o.status === "saiu"], entregue: ["Entregues", (o) => o.status === "entregue"], cancelado: ["Cancelados", (o) => o.status === "cancelado"], todos: ["Todos", () => true] };
	$("filters").innerHTML = Object.entries(F).map(([k, [v, fn]]) => `<button data-f="${k}" class="${filter === k ? "active" : ""}">${v} (${all.filter(fn).length})</button>`).join("");
	const n = all.filter((o) => o.status === "novo").length;
	$("newCount").textContent = String(n); $("newCount").hidden = !n;
	const list = all.filter(F[filter][1]);
	if (!all.some((o) => o.id === selId)) selId = list[0]?.id ?? all[0]?.id ?? null;
	const sel = all.find((o) => o.id === selId);
	$("ticket").innerHTML = sel ? ticketBody(sel) : `<div class="tc">Nenhum pedido para imprimir.</div>`;
	$("orders").innerHTML = list.length ? list.map((o) => `<div class="ocard ${o.id === selId ? "sel" : ""}" data-sel="${o.id}"><span class="onum">#${o.number}</span><div class="who"><b>${esc(o.customer)}</b><small>${esc(short(o))}</small></div>${o.updatedAt ? `<span class="badge req${o.updateSeen ? "" : " blink"}">⚠️ ALTERADO</span>` : ""}${pending(o).length ? `<span class="badge req">SOLICITAÇÃO</span>` : ""}${badge(o.status)}<span class="tot">${brl(orderTotal(o))}</span></div>`).join("") : `<div class="empty">🍱 Nenhum pedido aqui.<br>Os pedidos do WhatsApp aparecem automaticamente.</div>`;
	if (!sel) { $("detail").innerHTML = ""; return; }
	const o = sel, nx = NEXT[o.status], pv = PREV[o.status];
	$("detail").innerHTML = `<div class="card detail"><h3>Pedido #${o.number} ${badge(o.status)}</h3>
<div class="btns">${pv ? `<button class="btn sm" data-status="${o.id}|${pv[0]}">‹ Voltar p/ ${pv[1]}</button>` : ""}${nx ? `<button class="btn sm primary" data-status="${o.id}|${nx[0]}">${nx[1]}</button>` : ""}<button class="btn sm" data-print="${o.id}">🖨️ Imprimir</button>${active(o) ? `<button class="btn sm danger" data-cancel="${o.id}">⊘ Cancelar</button>` : ""}</div>
${o.updatedAt && !o.updateSeen ? `<div class="req blink">⚠️ <b>PEDIDO ALTERADO PELO CLIENTE</b> às ${new Date(o.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — imprima o cupom novo. <button class="btn sm green" data-seen="${o.id}">OK, vi</button></div>` : ""}<div><b>Itens:</b> ${esc(short(o))} · <b>Total:</b> ${brl(orderTotal(o))}</div>
${pending(o).map((r) => `<div class="req">⚠️ Cliente pediu <b>${r.type}</b>: "${esc(r.text)}" <button class="btn sm green" data-resolve="${o.id}|${r.id}|1">Aceitar</button> <button class="btn sm" data-resolve="${o.id}|${r.id}|0">Recusar</button></div>`).join("")}
<p><b>Cliente:</b> ${esc(o.customer)} · ${esc(fmtPhone(o.phone))}</p><p><b>Endereço:</b> ${esc(o.address)} (${esc(ZONE_LABEL[o.zone] || "")})</p><p><b>Pagamento:</b> ${esc(PAY_LABEL[o.payment] || o.payment)}</p>${o.changeFor ? `<p><b>Valor em dinheiro do cliente:</b> ${brl(o.changeFor)}<br><b>Valor do troco a entregar:</b> ${brl(o.changeFor - orderTotal(o))}</p>` : ""}
<div class="hist"><b>HISTÓRICO</b>${(o.history ?? []).map((h) => `<div>${new Date(h.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · ${esc(h.text)}</div>`).join("")}</div></div>`;
}

function renderFinancas() {
	const P = { hoje: ["Hoje", (t) => isToday(t)], semana: ["Últimos 7 dias", (t) => Date.now() - t < 7 * 864e5], tudo: ["Tudo", () => true] };
	$("period").innerHTML = Object.entries(P).map(([k, [v]]) => `<button data-p="${k}" class="${period === k ? "active" : ""}">${v}</button>`).join("");
	const inP = data.orders.filter((o) => P[period][1](o.createdAt));
	const ok = inP.filter((o) => o.status !== "cancelado"), canc = inP.filter((o) => o.status === "cancelado");
	const fat = ok.reduce((a, o) => a + orderTotal(o), 0);
	$("finStats").innerHTML = `<div class="stat"><span>Faturamento</span><b>${brl(fat)}</b><small>sem cancelados</small></div><div class="stat"><span>Pedidos válidos</span><b>${ok.length}</b></div><div class="stat"><span>Ticket médio</span><b>${brl(ok.length ? fat / ok.length : 0)}</b></div><div class="stat"><span>Cancelados</span><b>${canc.length}</b><small>${brl(canc.reduce((a, o) => a + orderTotal(o), 0))} não contabilizados</small></div>`;
	const pays = ["pix", "credito", "debito", "dinheiro"];
	$("byPay").innerHTML = pays.map((p) => { const l = ok.filter((o) => o.payment === p || (p === "credito" && o.payment === "cartao")); const v = l.reduce((a, o) => a + orderTotal(o), 0); return `<div class="prow"><span>${PAY_LABEL[p]} (${l.length})</span><b>${brl(v)}</b></div><div class="bar"><i style="width:${fat ? (v / fat) * 100 : 0}%"></i></div>`; }).join("") + `<p class="muted small">Taxas de entrega incluídas: ${brl(ok.reduce((a, o) => a + (o.deliveryFee ?? 0), 0))}</p>`;
	$("ledger").innerHTML = inP.length ? `<table><tr><th>#</th><th>Cliente</th><th>Pagamento</th><th>Status</th><th>Valor</th></tr>${inP.map((o) => `<tr><td>${o.number}</td><td>${esc(o.customer)}</td><td>${esc(PAY_LABEL[o.payment] || "")}</td><td>${STATUS_LABEL[o.status]}</td><td>${brl(orderTotal(o))}</td></tr>`).join("")}</table>` : `<p class="muted small">Nenhum lançamento no período.</p>`;
}

function renderMenu() {
	const m = data.menu;
	$("menuEditor").innerHTML = "";
	m.categories.forEach((c) => addCategoryBlock(c));
	$("notes").value = m.notes || "";
	$("drinks").innerHTML = `<p class="muted small">Marque os disponíveis hoje. A IA oferece junto com os lanches.</p>`;
	m.drinks.forEach((d) => addDrinkRow(d));
}
function addCategoryBlock(c = { name: "", items: [] }) {
	const box = document.createElement("div");
	box.className = "mcat";
	box.innerHTML = `<div class="mcat-head"><input class="mcn" placeholder="Nome da categoria" value="${esc(c.name)}"/><button class="rm" type="button" data-rmcat title="Remover categoria">🗑️</button></div><div class="mitems"></div><button class="btn sm" type="button" data-additem>➕ Adicionar item</button>`;
	$("menuEditor").appendChild(box);
	(c.items.length ? c.items : [undefined]).forEach((i) => addItemRow(box, i));
	return box;
}
function addItemRow(box, i = { name: "", price: 0, desc: "", enabled: true }) {
	const row = document.createElement("div");
	row.className = "mitem" + (i.enabled === false ? " off" : "");
	row.innerHTML = `<div class="mitem-top"><input type="checkbox" class="me" ${i.enabled !== false ? "checked" : ""} title="Disponível"/><input class="mn" placeholder="Nome (ex.: Pizza Calabresa G)" value="${esc(i.name)}"/><input class="mp" type="number" step="0.5" min="0" value="${i.price}"/><button class="rm" type="button" data-rmitem title="Remover">🗑️</button></div><input class="md" placeholder="Descrição / ingredientes" value="${esc(i.desc || "")}"/><span class="offtag">INDISPONÍVEL</span>`;
	box.querySelector(".mitems").appendChild(row);
	return row;
}
function readCategories() {
	return [...document.querySelectorAll("#menuEditor .mcat")].map((b) => ({ name: b.querySelector(".mcn").value.trim() || "Cardápio", items: [...b.querySelectorAll(".mitem")].map((r) => ({ name: r.querySelector(".mn").value.trim(), price: Number(r.querySelector(".mp").value) || 0, desc: r.querySelector(".md").value.trim(), enabled: r.querySelector(".me").checked })).filter((i) => i.name) })).filter((c) => c.items.length);
}
function renumberProteins() {
	document.querySelectorAll("#proteinsList .num").forEach((el, i) => (el.textContent = i + 1));
}
function addProteinRow(value = "") {
	const row = document.createElement("div");
	row.className = "num-row";
	row.innerHTML = `<span class="num"></span><input class="protein" placeholder="Nome da carne" value="${esc(value)}"/><button class="rm" type="button" data-rmrow title="Remover">🗑️</button>`;
	$("proteinsList").appendChild(row);
	renumberProteins();
	return row;
}
function addDrinkRow(d = { id: "", name: "", price: 0, enabled: true }) {
	const row = document.createElement("div");
	row.className = "drink";
	row.dataset.id = d.id || "d" + Date.now() + Math.floor(Math.random() * 1000);
	row.innerHTML = `<input type="checkbox" class="de" ${d.enabled ? "checked" : ""} title="Disponível"/><input class="dn" placeholder="Nome da bebida" value="${esc(d.name)}"/><input class="dp" type="number" step="0.5" min="0" value="${d.price}"/><button class="rm" type="button" data-rmrow title="Remover">🗑️</button>`;
	$("drinks").insertBefore(row, $("drinks").lastElementChild);
	return row;
}

function renderConfig() {
	const c = data.config;
	$("botEnabled").checked = c.botEnabled !== false;
	$("botToggle").textContent = c.botEnabled !== false ? "🤖 ROBÔ LIGADO — clique p/ desligar" : "⛔ ROBÔ DESLIGADO — clique p/ ligar";
	$("botToggle").classList.toggle("off", c.botEnabled === false);
	$("open").checked = c.open !== false;
	$("openLbl").textContent = c.open !== false ? "Aberta" : "Fechada";
	$("openPill").textContent = c.open !== false ? "Aberta" : "Fechada";
	$("openPill").classList.toggle("off", c.open === false);
	$("pixShow").textContent = c.pixKey || DEFAULT_CONFIG.pixKey;
	$("ruralFee").value = c.ruralFee;
	$("aiUrl").value = c.aiUrl || AI_DEFAULT_URL;
	$("geminiKey").value = c.geminiKey || "";
	$("hubToken").value = c.hubToken || "";
	$("pixKey").value = c.pixKey || DEFAULT_CONFIG.pixKey;
	$("pixName").value = c.pixName || DEFAULT_CONFIG.pixName;
	$("closedMessage").value = c.closedMessage;
	$("welcomeMessage").value = c.welcomeMessage || DEFAULT_CONFIG.welcomeMessage;
	$("autoPrint").checked = !!prefs.autoPrint;
	$("paper").value = prefs.paper;
	$("fontSize").value = prefs.fontSize || "12";
}

function render() {
	if (!data) return;
	const fresh = data.orders.filter((o) => o.status === "novo" && knownIds && !knownIds.has(o.id));
	const changed = data.orders.filter((o) => o.updatedAt && o.updatedAt !== knownUpd.get(o.id) && knownUpd.has(o.id));
	knownIds = new Set(data.orders.map((o) => o.id));
	knownUpd = new Map(data.orders.map((o) => [o.id, o.updatedAt]));
	if (changed.length) { beep(); if (prefs.autoPrint) changed.forEach((o) => printOrder(o)); }
	if (fresh.length) { beep(); if (prefs.autoPrint) fresh.forEach((o) => !o.printedAt && printOrder(o)); }
	renderPainel(); renderPedidos(); renderFinancas();
	if (!document.activeElement || !document.activeElement.closest("#tab-cardapio, #tab-config")) { if (!menuDirty) renderMenu(); renderConfig(); }
}

/* Mostra se a IA está respondendo e por qual endereço, para o atendente não ficar no escuro. */
function renderAiStatus() {
	const el = $("aiStatus");
	if (!el || !data) return;
	const alert = data.aiAlert;
	const connected = data.aiConnection;
	el.className = alert ? "warn small" : "muted small";
	el.textContent = alert
		? `🔴 ${alert.text}`
		: connected ? `🟢 Última resposta da IA: ${new Date(connected.at).toLocaleTimeString("pt-BR")} · ${connected.provider === "panel" ? "painel conectado" : "Gemini"}`
		: "⚪ Conexão ainda não verificada. Salve a chave em Configurações e use Testar IA.";
}

async function renderStatus() {
	renderAiStatus();
	try {
		const s = await req({ type: "whatsapp:status" });
		const alive = s && Date.now() - (s.at ?? 0) < 25e3 && s.connected;
		$("status").textContent = alive ? (s.error ? "⚠️ " + s.error : "🟢 Conectado e atendendo") : "🔴 Abra o WhatsApp Web para o robô atender";
		const paused = await req({ type: "paused:list" });
		const entries = Object.entries(paused || {});
		$("paused").innerHTML = entries.length ? entries.map(([id, p]) => `<div class="pausedItem"><span>${esc(p.name || id.split("@")[0])}</span><button class="btn sm" data-unpause="${esc(id)}">Reativar robô</button></div>`).join("") : `<p class="muted small">Nenhuma conversa pausada.</p>`;
	} catch {}
}

function simAdd(text, who) {
	const log = $("simLog");
	if (log.querySelector("p.c")) log.innerHTML = "";
	const d = document.createElement("div");
	d.className = "msg " + who;
	d.innerHTML = esc(text).replace(/\*([^*\n]+)\*/g, "<b>$1</b>").replace(/_([^_\n]+)_/g, "<i>$1</i>");
	log.appendChild(d); log.scrollTop = log.scrollHeight;
}
$("simForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	const v = $("simInput").value.trim(); if (!v || !data) return;
	$("simInput").value = ""; simAdd(v, "me");
	simAdd("digitando…", "bot typing");
	const r = await botStep(sim, v, data.config, data.menu);
	$("simLog").querySelector(".typing")?.remove();
	if (r.error) simAdd("(Erro da IA: " + r.error + ")", "bot");
	sim = r.state; r.replies.forEach((t) => simAdd(t, "bot"));
	if (r.sendMenu) simAdd("📄 Cardápio PDF (no WhatsApp, enviado como documento).", "bot");
	if (r.createOrder) simAdd("(Simulação: no WhatsApp de verdade este pedido iria para a aba Pedidos.)", "bot");
});

function showTab(tab) {
	document.querySelectorAll("#rail button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
	document.querySelectorAll("main section").forEach((s) => (s.hidden = s.id !== "tab-" + tab));
	window.scrollTo(0, 0);
}

document.addEventListener("click", async (e) => {
	const row = e.target.closest("[data-sel],[data-open]");
	if (row && !e.target.closest("button")) { selId = row.dataset.sel || row.dataset.open; if (row.dataset.open) showTab("pedidos"); return renderPedidos(); }
	const t = e.target.closest("button");
	if (!t) return;
	if (t.dataset.tab) return showTab(t.dataset.tab);
	if (t.dataset.f) { filter = t.dataset.f; selId = null; return renderPedidos(); }
	if (t.dataset.p) { period = t.dataset.p; return renderFinancas(); }
	if (t.id === "printSel") return printOrder(data.orders.find((o) => o.id === selId));
	if (t.dataset.seen) return act({ type: "update-seen", id: t.dataset.seen });
	if (t.dataset.print) return printOrder(data.orders.find((o) => o.id === t.dataset.print));
	if (t.dataset.status) { const [id, status] = t.dataset.status.split("|"); return act({ type: "status", id, status }); }
	if (t.dataset.cancel) { const reason = prompt("Motivo do cancelamento:", "cancelado pelo atendente"); if (reason !== null) act({ type: "cancel", id: t.dataset.cancel, reason }); return; }
	if (t.dataset.resolve) { const [id, reqId, ok] = t.dataset.resolve.split("|"); return act({ type: "resolve", id, reqId, accept: ok === "1" }); }
	if (t.dataset.unpause) { await req({ type: "paused:set", chatId: t.dataset.unpause, paused: false }); return renderStatus(); }
	if (t.id === "simReset") { sim = newBotState(); $("simLog").innerHTML = `<p class="muted c">Escreva como o cliente, ex: "quero um xis frango sem mostarda pra entregar na Duque 555 no dinheiro".</p>`; return; }
	if (t.id === "openWa") { const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" }); if (tabs[0]) chrome.tabs.update(tabs[0].id, { active: true }); else chrome.tabs.create({ url: "https://web.whatsapp.com/" }); return; }
	if (t.id === "clearFinished") { if (confirm("Remover da lista os pedidos entregues e cancelados?")) act({ type: "clear-finished" }); return; }
	if (["addProtein", "addDrink"].includes(t.id) || t.dataset.rmrow !== undefined) menuDirty = true;
	if (t.id === "addCategory") { menuDirty = true; addCategoryBlock().querySelector(".mcn").focus(); return; }
	if (t.dataset.additem !== undefined) { menuDirty = true; addItemRow(t.closest(".mcat")).querySelector(".mn").focus(); return; }
	if (t.dataset.rmitem !== undefined) { menuDirty = true; t.closest(".mitem").remove(); return; }
	if (t.dataset.rmcat !== undefined) { if (confirm("Remover esta categoria e todos os itens?")) { menuDirty = true; t.closest(".mcat").remove(); } return; }
	if (t.id === "addProtein") { addProteinRow().querySelector("input").focus(); return; }
	if (t.id === "addDrink") { addDrinkRow().querySelector(".dn").focus(); return; }
	if (t.dataset.rmrow !== undefined) { t.closest(".num-row, .drink").remove(); renumberProteins(); return; }
	if (t.id === "saveMenu") {
		const categories = readCategories();
		if (!categories.length) return alert("Coloque pelo menos 1 item no cardápio.");
		const drinks = [...document.querySelectorAll("#drinks .drink")].map((r) => ({ id: r.dataset.id, enabled: r.querySelector(".de").checked, name: r.querySelector(".dn").value.trim(), price: Number(r.querySelector(".dp").value) })).filter((d) => d.name);
		document.activeElement?.blur();
		menuDirty = false;
		await act({ type: "menu", menu: { categories, notes: $("notes").value, drinks } });
		$("menuSaved").hidden = false; setTimeout(() => ($("menuSaved").hidden = true), 3000);
		return;
	}
	if (t.id === "saveConfig") {
		prefs = { autoPrint: $("autoPrint").checked, paper: $("paper").value, fontSize: $("fontSize").value };
		await chrome.storage.local.set({ [PREFS_KEY]: prefs });
		document.activeElement?.blur();
		await act({ type: "config", config: { ruralFee: Number($("ruralFee").value), pixKey: $("pixKey").value.trim(), pixName: $("pixName").value.trim(), closedMessage: $("closedMessage").value.trim(), welcomeMessage: $("welcomeMessage").value.trim(), aiUrl: $("aiUrl").value.trim(), geminiKey: $("geminiKey").value.trim(), hubToken: $("hubToken").value.trim() } });
		$("configSaved").hidden = false; setTimeout(() => ($("configSaved").hidden = true), 3000);
	}
	if (t.id === "testAi") {
		const status = $("aiTestResult");
		t.disabled = true;
		status.textContent = "Verificando a resposta da IA…";
		try {
			const result = await req({ type: "ai:test" });
			status.className = result.connected ? "ok small" : "warn small";
			status.textContent = result.message;
			data = await req({ type: "panel:get" });
			renderAiStatus();
		} catch (error) {
			status.className = "warn small";
			status.textContent = error.message || "Não foi possível verificar a conexão.";
		} finally { t.disabled = false; }
	}
});
$("botEnabled").addEventListener("change", (e) => act({ type: "config", config: { botEnabled: e.target.checked } }));
$("botToggle").addEventListener("click", () => act({ type: "config", config: { botEnabled: data.config.botEnabled === false } }));
$("open").addEventListener("change", (e) => act({ type: "config", config: { open: e.target.checked } }));

chrome.storage.onChanged.addListener(async (changes) => {
	if (changes["marmitex-prado-data"]) { data = await req({ type: "panel:get" }); render(); }
});

(async () => {
	prefs = { ...prefs, ...((await chrome.storage.local.get(PREFS_KEY))[PREFS_KEY] || {}) };
	data = await req({ type: "panel:get" });
	render();
	renderStatus();
	setInterval(renderStatus, 5000);
	setInterval(renderPainel, 60000);
})();

document.addEventListener("change", (e) => { if (e.target.classList?.contains("me")) e.target.closest(".mitem").classList.toggle("off", !e.target.checked); });
document.addEventListener("input", (e) => { if (e.target.closest("#tab-cardapio")) menuDirty = true; });
