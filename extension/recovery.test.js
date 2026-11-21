import { test, expect } from 'bun:test';
import { botStep, DEFAULT_CONFIG, DEFAULT_MENU, orderTotal } from './bot.js';

const contact = { phone: '5567984137155' };
const unavailable = async () => ({ ok: false, status: 403, json: async () => ({ error: { message: 'test: AI unavailable' } }) });
const initial = () => ({ step: 'conversa', history: [{ role: 'user', content: 'Olá' }, { role: 'assistant', content: 'Bem-vindo' }] });

test('the photographed Calabresa request continues to size and preserves the flavor', async () => {
  const first = await botStep(initial(), 'Quero uma calabresa', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact);
  expect(first.state.pendingPizza).toBe('Quero uma calabresa');
  expect(first.error).toBe('test: AI unavailable');
  const second = await botStep(first.state, 'G', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact);
  expect(second.state.draftOrder.items).toEqual([{ name: 'Pizza Calabresa G', qty: 1, unit: 56, obs: '' }]);
  expect(second.state.recoveryStep).toBe('items');
});

test('cash order progresses to review and OK creates the preserved order during AI failure', async () => {
  let state = initial();
  for (const text of ['Quero uma calabresa', 'G', 'só isso', 'Alexandre Santana', 'entrega', 'Rua Eugênio Cantarelli, 15, Vila Maria, apto 03 Bloco C', 'dinheiro', '100']) {
    state = (await botStep(state, text, DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact)).state;
  }
  expect(state.pendingOrder.name).toBe('Alexandre Santana');
  expect(state.pendingOrder.address).toBe('Rua Eugênio Cantarelli, 15, Vila Maria, apto 03 Bloco C');
  expect(state.pendingOrder.changeFor - orderTotal(state.pendingOrder, DEFAULT_CONFIG)).toBe(44);
  const done = await botStep(state, 'Ok', DEFAULT_CONFIG, DEFAULT_MENU, () => { throw Error('confirmation must not invoke AI'); }, contact);
  expect(done.createOrder.items).toHaveLength(1);
  expect(done.createOrder.payment).toBe('dinheiro');
  expect(done.state.step).toBe('feito');
});

test('waiting-only successful AI output uses the same recovery path', async () => {
  const waiting = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reply: 'Só um instante! Estou conferindo seu pedido e já te respondo.', order: null }) }] } }] }) });
  const result = await botStep(initial(), 'Quero uma calabresa', DEFAULT_CONFIG, DEFAULT_MENU, waiting, contact);
  expect(result.state.pendingPizza).toBe('Quero uma calabresa');
});

test('an old stalled session can recover its Calabresa choice when G arrives after updating', async () => {
  const state = { ...initial(), history: [...initial().history, { role: 'user', content: 'Quero uma calabresa' }], warned: true };
  const result = await botStep(state, 'G', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact);
  expect(result.state.draftOrder.items[0].name).toBe('Pizza Calabresa G');
  expect(result.state.draftOrder.items[0].unit).toBe(56);
});

test('a recovered second pizza is added without losing the first', async () => {
  let state = (await botStep(initial(), 'Calabresa G', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact)).state;
  state = (await botStep(state, 'Vegetariana G', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact)).state;
  expect(state.draftOrder.items.map((item) => item.name)).toEqual(['Pizza Calabresa G', 'Pizza Vegetariana G']);
  expect(orderTotal(state.draftOrder, DEFAULT_CONFIG)).toBe(106);
});

test('a cash amount below the total never produces a confirmable order', async () => {
  let state = initial();
  for (const text of ['Calabresa G', 'só isso', 'Alexandre Santana', 'retirada', 'dinheiro', '50'])
    state = (await botStep(state, text, DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact)).state;
  expect(state.recoveryStep).toBe('cash');
  expect(state.pendingOrder).toBeUndefined();
  state = (await botStep(state, '100', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact)).state;
  expect(state.pendingOrder.changeFor).toBe(100);
});

test('recovery never adds an unavailable Calabresa G', async () => {
  const menu = structuredClone(DEFAULT_MENU);
  for (const item of menu.categories.flatMap((category) => category.items)) if (item.name === 'Pizza Calabresa G') item.enabled = false;
  const result = await botStep(initial(), 'Calabresa G', DEFAULT_CONFIG, menu, unavailable, contact);
  expect(result.state.draftOrder).toBeUndefined();
  expect(result.createOrder).toBeUndefined();
});

test('recovery preserves the order rather than guessing an ambiguous change', async () => {
  const draftOrder = { name: '', phone: contact.phone, items: [{ name: 'Pizza Calabresa G', qty: 1, unit: 56 }], drinks: [], zone: '', address: '', payment: '' };
  const state = { ...initial(), draftOrder };
  const result = await botStep(state, 'trocar a calabresa', DEFAULT_CONFIG, DEFAULT_MENU, unavailable, contact);
  expect(result.state.draftOrder).toEqual(draftOrder);
  expect(result.createOrder).toBeUndefined();
});