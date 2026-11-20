import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Bot,
  MessageCircle,
  UtensilsCrossed,
  Wallet,
  Settings,
  ArrowLeft,
  Printer,
  Trash2,
  Plus,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo, type Settings as Config } from "./store";
import { money, total, type Order } from "./engine";
import { Phone } from "./phone";
import logo from "@/assets/orbit-logo.png.asset.json";
const tabs = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Pedidos", icon: ClipboardList },
  { label: "Atendente", icon: Bot },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Cardápio", icon: UtensilsCrossed },
  { label: "Finanças", icon: Wallet },
  { label: "Configurações", icon: Settings },
];
const statuses = ["novo", "cozinha", "saiu", "entregue", "cancelado"];
export function AdminPanel() {
  const { orders, setOrders, menu, setMenu, settings, setSettings } = useDemo();
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("todos");
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [period, setPeriod] = useState("Hoje");
  const revenue = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((n, o) => n + total(o.items, o.payment, o.fee), 0);
  const update = (key: keyof Config, value: Config[keyof Config]) =>
    setSettings((s) => ({ ...s, [key]: value }));
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <Link to="/" className="brand">
          <img src={logo.url} alt="" />
          <div>
            <strong>ORBIT</strong>
            <small>PAINEL DO ATENDENTE</small>
          </div>
        </Link>
        <span className="admin-demo">AMBIENTE DE DEMONSTRAÇÃO</span>
        <nav>
          {tabs.map(({ label, icon: Icon }, i) => (
            <Button
              key={label}
              variant={tab === i ? "default" : "ghost"}
              onClick={() => {
                setTab(i);
                setSaved(false);
              }}
            >
              <Icon />
              {label}
              {i === 1 && orders.length > 0 && <b>{orders.length}</b>}
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            Dados de teste nesta sessão.
            <br />
            Sem conexão com pedidos reais.
          </p>
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft /> Voltar ao site
            </Link>
          </Button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <span className="eyebrow">ORBIT · DEMONSTRAÇÃO ABSOLLUTO</span>
            <h1>{tabs[tab]?.label}</h1>
          </div>
          <div className="admin-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.bot}
                onChange={(e) => update("bot", e.target.checked)}
              />
              <Bot size={17} />
              {settings.bot ? "Robô ligado" : "Robô pausado"}
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.open}
                onChange={(e) => update("open", e.target.checked)}
              />
              {settings.open ? "Aberta" : "Fechada"}
            </label>
          </div>
        </header>
        <div className="admin-warning">
          <span /> Painel de teste · os pedidos da conversa aparecem aqui · alterações valem apenas
          nesta sessão.
        </div>
        {(tab === 0 || tab === 5) && (
          <>
            <div className="stats">
              <div>
                <span>Pedidos de teste</span>
                <strong>{orders.length}</strong>
                <small>Total desta sessão</small>
              </div>
              <div>
                <span>Em andamento</span>
                <strong>
                  {orders.filter((o) => ["novo", "cozinha", "saiu"].includes(o.status)).length}
                </strong>
                <small>Da confirmação à entrega</small>
              </div>
              <div>
                <span>Faturamento simulado</span>
                <strong>{money(revenue)}</strong>
                <small>Sem pedidos cancelados</small>
              </div>
              <div>
                <span>Ticket médio</span>
                <strong>
                  {money(
                    orders.length
                      ? revenue / orders.filter((o) => o.status !== "cancelado").length || 0
                      : 0,
                  )}
                </strong>
                <small>Por pedido de teste</small>
              </div>
            </div>
            {tab === 0 ? (
              <>
                <div className="panel-heading">
                  <h2>Fila de pedidos</h2>
                  <Button variant="outline" onClick={() => setTab(1)}>
                    Ver todos
                  </Button>
                </div>
                <OrderList
                  orders={orders.filter((o) => !["entregue", "cancelado"].includes(o.status))}
                  onSelect={setSelected}
                />
                <div className="panel-heading">
                  <h2>Solicitações de clientes</h2>
                </div>
                <p className="empty-line">Nenhuma solicitação pendente nesta sessão.</p>
              </>
            ) : (
              <>
                <div className="tabs">
                  {["Hoje", "7 dias", "30 dias"].map((p) => (
                    <Button
                      variant={period === p ? "default" : "ghost"}
                      key={p}
                      onClick={() => setPeriod(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                <h2 className="subheading">Por forma de pagamento</h2>
                <div className="payment-breakdown">
                  {["pix", "debito", "credito", "dinheiro"].map((p) => (
                    <div key={p}>
                      <span>{p.toUpperCase()}</span>
                      <strong>
                        {money(
                          orders
                            .filter((o) => o.payment === p && o.status !== "cancelado")
                            .reduce((n, o) => n + total(o.items, o.payment, o.fee), 0),
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
                <h2 className="subheading">Lançamentos de teste</h2>
                <OrderList orders={orders} onSelect={setSelected} />
              </>
            )}
          </>
        )}
        {tab === 1 && (
          <>
            <div className="panel-heading">
              <h2>Todos os pedidos</h2>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer /> Imprimir
              </Button>
            </div>
            <div className="tabs status-tabs">
              {["todos", ...statuses].map((s) => (
                <Button
                  key={s}
                  variant={filter === s ? "default" : "ghost"}
                  onClick={() => setFilter(s)}
                >
                  {s === "todos" ? "Todos" : s}
                </Button>
              ))}
            </div>
            <OrderList
              orders={orders.filter((o) => filter === "todos" || o.status === filter)}
              onSelect={setSelected}
            />
          </>
        )}
        {tab === 2 && (
          <div className="admin-chat">
            <div>
              <h2>Atendente de demonstração</h2>
              <p>Teste um pedido e confira seu registro em Pedidos.</p>
              <p>
                O teste escrito não usa IA nem transcreve áudio. A extensão mantém seu atendimento
                no WhatsApp.
              </p>
            </div>
            <Phone />
          </div>
        )}
        {tab === 3 && (
          <div className="whats-panel">
            <MessageCircle size={48} />
            <h2>Atendimento exclusivo no WhatsApp</h2>
            <p>
              Este painel é uma demonstração. Ele não conecta, envia mensagens ou acessa conversas
              reais.
            </p>
            <Button asChild className="whatsapp-button">
              <a href="https://wa.me/5567984137155" target="_blank" rel="noreferrer">
                <MessageCircle /> Falar com a Absolluto
              </a>
            </Button>
            <h3>Na extensão</h3>
            <ul>
              <li>Atendimento de mensagens de texto e áudio.</li>
              <li>Pedido com sabores, tamanhos, observações e bebidas.</li>
              <li>Confirmação, alterações e acompanhamento do pedido.</li>
              <li>Conversas pausadas e impressão dos pedidos.</li>
            </ul>
            <h3>Conversas pausadas</h3>
            <p>Nenhuma conversa real conectada.</p>
          </div>
        )}
        {tab === 4 && (
          <div className="editor">
            <div className="panel-heading">
              <h2>Itens do cardápio</h2>
              <Button onClick={save}>
                {saved ? <Check /> : <Save />}
                {saved ? "Salvo nesta sessão" : "Salvar cardápio"}
              </Button>
            </div>
            {menu.categories.map((cat, ci) => (
              <section key={ci}>
                <div className="category-heading">
                  <input
                    aria-label={`Nome da categoria ${ci + 1}`}
                    value={cat.name}
                    onChange={(e) =>
                      setMenu((m) => ({
                        ...m,
                        categories: m.categories.map((c, k) =>
                          k === ci ? { ...c, name: e.target.value } : c,
                        ),
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMenu((m) => ({
                        ...m,
                        categories: m.categories.map((c, k) =>
                          k === ci
                            ? {
                                ...c,
                                items: [
                                  ...c.items,
                                  { name: "Nova Pizza P", price: 0, desc: "", enabled: true },
                                ],
                              }
                            : c,
                        ),
                      }))
                    }
                  >
                    <Plus /> Item
                  </Button>
                </div>
                <div className="editor-labels">
                  <span>Disponível / nome e tamanho</span>
                  <span>Valor R$</span>
                  <span>Descrição</span>
                </div>
                {cat.items.map((item, ii) => (
                  <div
                    className={`editor-row ${item.enabled === false ? "disabled-item" : ""}`}
                    key={ii}
                  >
                    <label>
                      <input
                        type="checkbox"
                        aria-label={`Disponibilidade ${item.name}`}
                        checked={item.enabled !== false}
                        onChange={(e) =>
                          setMenu((m) => ({
                            ...m,
                            categories: m.categories.map((c, k) =>
                              k === ci
                                ? {
                                    ...c,
                                    items: c.items.map((it, j) =>
                                      j === ii ? { ...it, enabled: e.target.checked } : it,
                                    ),
                                  }
                                : c,
                            ),
                          }))
                        }
                      />
                      <input
                        aria-label={`Nome ${item.name}`}
                        value={item.name}
                        onChange={(e) =>
                          setMenu((m) => ({
                            ...m,
                            categories: m.categories.map((c, k) =>
                              k === ci
                                ? {
                                    ...c,
                                    items: c.items.map((it, j) =>
                                      j === ii ? { ...it, name: e.target.value } : it,
                                    ),
                                  }
                                : c,
                            ),
                          }))
                        }
                      />
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      aria-label={`Preço ${item.name}`}
                      value={item.price}
                      onChange={(e) =>
                        setMenu((m) => ({
                          ...m,
                          categories: m.categories.map((c, k) =>
                            k === ci
                              ? {
                                  ...c,
                                  items: c.items.map((it, j) =>
                                    j === ii
                                      ? { ...it, price: Math.max(0, Number(e.target.value)) }
                                      : it,
                                  ),
                                }
                              : c,
                          ),
                        }))
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${item.name}`}
                      onClick={() =>
                        setMenu((m) => ({
                          ...m,
                          categories: m.categories.map((c, k) =>
                            k === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c,
                          ),
                        }))
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </section>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setMenu((m) => ({
                  ...m,
                  categories: [...m.categories, { name: "Nova categoria", items: [] }],
                }))
              }
            >
              <Plus /> Categoria
            </Button>
            <h2 className="subheading">Bebidas</h2>
            {menu.drinks.map((d, i) => (
              <div className="drink-editor" key={i}>
                <input
                  type="checkbox"
                  aria-label={`Disponibilidade ${d.name}`}
                  checked={d.enabled}
                  onChange={(e) =>
                    setMenu((m) => ({
                      ...m,
                      drinks: m.drinks.map((x, j) =>
                        j === i ? { ...x, enabled: e.target.checked } : x,
                      ),
                    }))
                  }
                />
                <input
                  aria-label={`Nome ${d.name}`}
                  value={d.name}
                  onChange={(e) =>
                    setMenu((m) => ({
                      ...m,
                      drinks: m.drinks.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x,
                      ),
                    }))
                  }
                />
                <input
                  type="number"
                  min="0"
                  aria-label={`Preço ${d.name}`}
                  value={d.price}
                  onChange={(e) =>
                    setMenu((m) => ({
                      ...m,
                      drinks: m.drinks.map((x, j) =>
                        j === i ? { ...x, price: Math.max(0, Number(e.target.value)) } : x,
                      ),
                    }))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Excluir ${d.name}`}
                  onClick={() =>
                    setMenu((m) => ({ ...m, drinks: m.drinks.filter((_, j) => j !== i) }))
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setMenu((m) => ({
                  ...m,
                  drinks: [
                    ...m.drinks,
                    { id: String(Date.now()), name: "Nova bebida", price: 0, enabled: true },
                  ],
                }))
              }
            >
              <Plus /> Bebida
            </Button>
            <label className="form-label">
              Informações extras
              <textarea
                rows={5}
                value={menu.notes}
                onChange={(e) => setMenu((m) => ({ ...m, notes: e.target.value }))}
              />
            </label>
          </div>
        )}
        {tab === 6 && (
          <div className="config-form">
            <h2>Ajustes do atendimento</h2>
            <p>Configurações de demonstração, sem chaves privadas ou acesso à operação real.</p>
            <label className="form-label">
              Taxa de entrega (R$)
              <input
                type="number"
                min="0"
                step="0.5"
                value={settings.fee}
                onChange={(e) => update("fee", Math.max(0, Number(e.target.value)))}
              />
            </label>
            <label className="form-label">
              Chave PIX
              <input value={settings.pix} onChange={(e) => update("pix", e.target.value)} />
            </label>
            <label className="form-label">
              Titular PIX
              <input value={settings.holder} onChange={(e) => update("holder", e.target.value)} />
            </label>
            <label className="form-label">
              Boas-vindas
              <textarea
                rows={4}
                value={settings.welcome}
                onChange={(e) => update("welcome", e.target.value)}
              />
            </label>
            <label className="form-label">
              Mensagem quando fechado
              <textarea
                rows={3}
                value={settings.closed}
                onChange={(e) => update("closed", e.target.value)}
              />
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.autoPrint}
                onChange={(e) => update("autoPrint", e.target.checked)}
              />{" "}
              Impressão automática de teste
            </label>
            <div className="form-columns">
              <label className="form-label">
                Papel
                <select value={settings.paper} onChange={(e) => update("paper", e.target.value)}>
                  <option>80</option>
                  <option>58</option>
                </select>
              </label>
              <label className="form-label">
                Fonte do cupom
                <select value={settings.font} onChange={(e) => update("font", e.target.value)}>
                  {["12", "14", "16", "18", "20"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <Button onClick={save}>
                {saved ? <Check /> : <Save />}
                {saved ? "Ajustes salvos" : "Salvar ajustes"}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setOrders((o) => o.filter((x) => !["cancelado", "entregue"].includes(x.status)))
                }
              >
                <Trash2 /> Limpar finalizados
              </Button>
            </div>
          </div>
        )}
      </main>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="panel-heading">
              <h2>Pedido de teste #{selected.id}</h2>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Fechar
              </Button>
            </div>
            <h3>{selected.name}</h3>
            <p>
              {selected.phone} · {selected.created}
            </p>
            <ul>
              {selected.items.map((i, k) => (
                <li key={k}>
                  {i.qty}x {i.name} — {money(i.price * i.qty)}
                  {i.obs && <p>{i.obs}</p>}
                </li>
              ))}
            </ul>
            <p>🏠 {selected.address || "Retirada no local"}</p>
            <p>
              💳 {selected.payment.toUpperCase()} · Entrega {money(selected.fee)}
            </p>
            {selected.payment === "dinheiro" && (
              <>
                <p>
                  Valor em dinheiro do cliente:{" "}
                  {money(selected.cash || total(selected.items, selected.payment, selected.fee))}
                </p>
                <p>
                  Valor do troco a entregar:{" "}
                  {money(
                    selected.cash
                      ? selected.cash - total(selected.items, selected.payment, selected.fee)
                      : 0,
                  )}
                </p>
              </>
            )}
            <strong className="order-total">
              Total {money(total(selected.items, selected.payment, selected.fee))}
            </strong>
            <label className="form-label">
              Status
              <select
                value={selected.status}
                onChange={(e) => {
                  const next = { ...selected, status: e.target.value };
                  setSelected(next);
                  setOrders((o) => o.map((i) => (i.id === next.id ? next : i)));
                }}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Imprimir pedido
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
function OrderList({ orders, onSelect }: { orders: Order[]; onSelect: (o: Order) => void }) {
  return orders.length ? (
    <div className="order-table">
      <div className="order-table-head">
        <span>Pedido / cliente</span>
        <span>Pagamento</span>
        <span>Total</span>
        <span>Status</span>
        <span />
      </div>
      {orders.map((o) => (
        <div className="order-table-row" key={o.id}>
          <div>
            <strong>
              #{o.id} · {o.name}
            </strong>
            <small>
              {o.created} · {o.items.length} itens
            </small>
          </div>
          <span>{o.payment}</span>
          <strong>{money(total(o.items, o.payment, o.fee))}</strong>
          <span className={`status-badge ${o.status}`}>{o.status}</span>
          <Button variant="outline" size="sm" onClick={() => onSelect(o)}>
            Detalhes
          </Button>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty-orders">
      <ClipboardList size={34} />
      <h3>A fila está pronta para seu primeiro teste.</h3>
      <p>Confirme um pedido na conversa e veja todos os detalhes aqui.</p>
      <Button variant="outline" asChild>
        <Link to="/">Experimentar atendimento</Link>
      </Button>
    </div>
  );
}
