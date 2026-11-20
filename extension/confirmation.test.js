import { test, expect } from 'bun:test';
import { botStep, DEFAULT_CONFIG, DEFAULT_MENU } from './bot.js';
const order = { name: 'Lucas Ariel', phone: '5514999999999', items: [{name:'Pizza G meio a meio Frango/Catupiry e Bacon',qty:1,unit:52},{name:'Pizza G meio a meio Margarita e Quatro Queijos',qty:1,unit:48},{name:'Pizza Calabresa G',qty:1,unit:56,obs:'Sem cebola, bem assada, com borda de chocolate'},{name:'Pizza Moda da Casa G',qty:1,unit:56,obs:'Sem milho, sem palmito, com borda de bacon'}], drinks: [], zone:'entrega', address:'Rua Vinícius frangipani, 332, Jaú, SP', payment:'debito' };
const contact = { phone: order.phone };
const state = {step:'conversa',editing:true,upsellAsked:true,pizzaItems:order.items,history:[{role:'user',content:'Quero pra entregar'},{role:'assistant',content:'Envie a localização ou endereço'}]};
const response = (v) => ({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(v)}]}}]})});
test('alteração de entrega seguida de Ok registra as quatro pizzas atualizadas', async()=>{
 let calls=0;
 const ai=async()=>response(++calls===1 ? {reply:'Confira seu pedido atualizado. Está tudo certinho? Escreva OK para confirmar ou ALTERAR.',order:null} : {reply:'Confira',order});
 const reviewed=await botStep(state,'Rua Vinícius frangipani 332 Jaú sp',DEFAULT_CONFIG,DEFAULT_MENU,ai,contact);
 const done=await botStep(reviewed.state,'Ok',DEFAULT_CONFIG,DEFAULT_MENU,async()=>{throw Error('OK não deve depender da IA')},contact);
 expect(done.createOrder?.address).toBe(order.address);
 expect(done.createOrder?.items).toHaveLength(4);
 expect(done.createOrder?.payment).toBe('debito');
 expect(done.state.step).toBe('feito');
});