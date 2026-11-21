import { test, expect } from 'bun:test';
import { DEFAULT_CONFIG, DEFAULT_MENU } from './bot.js';

test('recovered WhatsApp order is saved once and reads back through panel:get', async () => {
  let listener;
  const stored = {};
  const noop = { addListener() {} };
  const previousChrome = globalThis.chrome;
  const previousFetch = globalThis.fetch;
  globalThis.chrome = {
    runtime: { getURL: () => 'chrome-extension://recovery/', onInstalled: noop, onConnect: noop, onMessage: { addListener(fn) { listener = fn; } } },
    action: { onClicked: noop },
    storage: { local: { get: async () => structuredClone(stored), set: async (value) => Object.assign(stored, structuredClone(value)) } },
  };
  globalThis.fetch = async () => ({ ok: false, status: 403, json: async () => ({ error: { message: 'test: AI unavailable' } }) });
  try {
    await import('./background.js?recovery');
    stored['marmitex-prado-data'] = { orders: [], seq: 1, config: DEFAULT_CONFIG, menu: DEFAULT_MENU };
    const chatId = '5567984137155@c.us';
    const sender = { url: 'https://web.whatsapp.com/', tab: { id: 1 } };
    const send = (message, origin = sender) => new Promise((resolve) => listener(message, origin, resolve));
    const steps = ['Olá', 'Quero uma calabresa', 'G', 'só isso', 'Alexandre Santana', 'retirada', 'dinheiro', '100', 'Ok'];
    let confirmation;
    for (const [index, text] of steps.entries()) {
      const messageId = `false_recovery_${10000000 + index}`;
      const response = await send({ type: 'whatsapp:incoming', chatId, messageId, phone: '5567984137155', text });
      expect(response.ok).toBe(true);
      if (text === 'Ok') confirmation = response;
      await send({ type: 'whatsapp:sent', chatId, messageId });
    }
    expect(confirmation.value.text).toContain('#1');
    const panel = await send({ type: 'panel:get' }, { url: 'chrome-extension://recovery/sidepanel.html' });
    expect(panel.ok).toBe(true);
    expect(panel.value.orders).toHaveLength(1);
    expect(panel.value.orders[0].customer).toBe('Alexandre Santana');
    expect(panel.value.orders[0].items[0].name).toBe('Pizza Calabresa G');
    expect(panel.value.orders[0].changeFor).toBe(100);
    const duplicate = await send({ type: 'whatsapp:incoming', chatId, messageId: 'false_recovery_10000008', phone: '5567984137155', text: 'Ok' });
    expect(duplicate.value.text).toBe('');
    expect(stored['marmitex-prado-data'].orders).toHaveLength(1);
  } finally {
    globalThis.chrome = previousChrome;
    globalThis.fetch = previousFetch;
  }
});