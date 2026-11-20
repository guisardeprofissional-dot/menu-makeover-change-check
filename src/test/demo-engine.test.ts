import { describe, it, expect } from "vitest";
import { advance, blank, initialMenu, total, halfPrice, chatMenu, money } from "@/features/demo/engine";
import reference from "@/data/pizzeria.json";
describe("Website demo order rules", () => {
  it("provides every available flavor, size, price and drink in the conversation", () => {
    const result = advance(blank(), "quero o cardápio", initialMenu, 0);
    for (const item of initialMenu.categories.flatMap((category) => category.items)) {
      expect(result.reply).toContain(item.name.replace(/^Pizza /, "").replace(/ [PMG]$/, ""));
      expect(result.reply).toContain(`${item.name.slice(-1)}: ${money(item.price)}`);
    }
    for (const drink of initialMenu.drinks) {
      expect(result.reply).toContain(`${drink.name} — ${money(drink.price)}`);
    }
  });
  it("keeps the active order step and data when the customer asks for the menu", () => {
    for (const step of ["items", "name", "phone", "delivery", "address", "payment", "cash", "review", "done"]) {
      const c = { ...blank(), step, name: "Lucas", items: [{ name: "Pizza Calabresa G", qty: 1, price: 56 }] };
      const result = advance(c, "cardapio", initialMenu, 0);
      expect(result.c).toEqual(c);
      expect(result.confirmed).toBe(false);
      expect(result.reply).toBe(chatMenu(initialMenu));
    }
  });
  it("shows the current catalog on greeting and reflects availability and price edits", () => {
    const menu = structuredClone(initialMenu);
    menu.categories = [{ name: "Pizzas", items: [
      { name: "Pizza Especial G", price: 72, desc: "", enabled: true },
      { name: "Pizza Oculta P", price: 39, desc: "", enabled: false },
    ] }];
    menu.drinks[0] = { id: "suco", name: "Suco indisponível", price: 15, enabled: false };
    const result = advance(blank(), "Olá", menu, 0);
    expect(result.reply).toContain("Especial");
    expect(result.reply).toContain("G: R$ 72,00");
    expect(result.reply).not.toContain("Oculta");
    expect(result.reply).not.toContain("Suco indisponível");
  });
  it("preserves every source menu item and price", () => {
    expect(initialMenu.categories.flatMap((c) => c.items)).toHaveLength(69);
    expect(initialMenu.drinks).toHaveLength(5);
    expect(
      initialMenu.categories[0]?.items.find((i) => i.name === "Pizza Calabresa G")?.price,
    ).toBe(56);
    expect(reference.menu).toEqual(initialMenu);
  });
  it("computes half of each flavor price", () => {
    expect(halfPrice(56, 65)).toBe(60.5);
  });
  it("adds card fees without losing items", () => {
    const items = [{ name: "Pizza G", qty: 1, price: 56 }];
    expect(total(items, "debito")).toBe(58);
    expect(total(items, "credito")).toBe(58.5);
    expect(total(items, "pix")).toBe(56);
  });
  it("cash confirmation retains customer cash and change values", () => {
    let c = blank();
    for (const text of [
      "1 Calabresa G",
      "só isso",
      "Lucas",
      "14999999999",
      "entrega",
      "Rua Vinícius 332 Jaú SP",
      "dinheiro",
      "100",
    ])
      c = advance(c, text, initialMenu, 0).c;
    expect(c.step).toBe("review");
    expect(c.cash).toBe(100);
    expect(c.cash - total(c.items, c.payment)).toBe(44);
    const result = advance(c, "Ok", initialMenu, 0);
    expect(result.confirmed).toBe(true);
    expect(result.c.step).toBe("done");
  });
  it("edits delivery before confirmation without duplicating pizzas", () => {
    let c = blank();
    for (const text of [
      "1 Calabresa G",
      "só isso",
      "Lucas",
      "14999999999",
      "retirada",
      "débito",
      "quero pra entregar",
      "Rua Vinícius 332 Jaú SP",
      "débito",
      "Ok",
    ])
      c = advance(c, text, initialMenu, 0).c;
    expect(c.step).toBe("done");
    expect(c.zone).toBe("entrega");
    expect(c.items).toHaveLength(1);
    expect(c.address).toBe("Rua Vinícius 332 Jaú SP");
  });
  it("does not offer unavailable items", () => {
    const m = structuredClone(initialMenu);
    const i = m.categories[0]?.items.find((i) => i.name === "Pizza Calabresa G");
    if (i) i.enabled = false;
    expect(advance(blank(), "1 Calabresa G", m, 0).c.items).toHaveLength(0);
  });
});
