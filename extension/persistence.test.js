import { test, expect } from 'bun:test';
import { DEFAULT_CONFIG, DEFAULT_MENU } from './bot.js';

test('OK salva no painel, envia número e não duplica ao repetir a mesma mensagem', async () => {
  let listener;
  const stored = {};
  const noop = { addListener() {} };
  globalThis.chrome = {
    runtime: { getURL: () => 'chrome-extension://test/', onInstalled: noop, onConnect: noop, onMessage: { addListener(fn) { listener = fn; } } },
    action: { onClicked: noop },
    storage: { local: { get: async () => structuredClone(stored), set: async v => Object.assign(stored, structuredClone(v)) } },
  };
  await import('./background.js');
  const id = '5514999999999@c.us';
  const order = { name: 'Lucas Ariel', phone: '5514999999999', items: [{name:'Pizza Calabresa G',qty:4,unit:56}], drinks: [], zone:'entrega', address:'Rua Vinícius frangipani, 332, Jaú, SP', payment:'debito', deliveryFee:0 };
  stored['marmitex-prado-data'] = {orders:[],seq:1,config:DEFAULT_CONFIG,menu:DEFAULT_MENU};
  stored['marmitex-prado-sessions'] = {[id]: {state:{step:'conversa',pendingOrder:order,history:[],editing:false},seen:[],lastAt:Date.now(),botTexts:['ok']}};
  const send = message => new Promise(resolve => listener(message,{url:'https://web.whatsapp.com/',tab:{id:1}},resolve));
  const message = {type:'whatsapp:incoming',chatId:id,messageId:'false_confirmation_12345678',text:'Ok',phone:order.phone};
  const reply = await send(message);
  expect(reply.ok).toBe(true);
  expect(reply.value.text).toContain('#1');
  expect(stored['marmitex-prado-data'].orders).toHaveLength(1);
  expect(stored['marmitex-prado-data'].orders[0].address).toBe(order.address);
  await send({type:'whatsapp:sent',chatId:id,messageId:message.messageId});
  await send(message);
  expect(stored['marmitex-prado-data'].orders).toHaveLength(1);
  expect(stored['marmitex-prado-sessions'][id].state.step).toBe('feito');
});