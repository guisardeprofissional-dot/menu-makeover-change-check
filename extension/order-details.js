// Shared, browser-safe delivery and contact validation for the extension.
export const LOCATION_REQUEST = "📍🏠 Por gentileza, nós preferimos a localização! Envie a localização para a entrega. 🙏 Caso realmente não consiga enviar, pode passar o endereço completo: rua, número da casa, bairro e ponto de referência. 🍕😊";

export function customerPhone(value) {
	const raw = String(value ?? "").trim();
	if (/@lid$/.test(raw) || /^chat/i.test(raw)) return "";
	if (raw.includes("@") && !/@(?:c\.us|s\.whatsapp\.net)$/.test(raw)) return "";
	const digits = raw.split("@")[0].split(":")[0].replace(/\D/g, "");
	return /^(?:55)?[1-9]\d{9,10}$/.test(digits) ? digits : "";
}

export function formatPhone(value) {
	const phone = customerPhone(value);
	if (!phone) return "Não informado";
	const d = phone.length > 11 && phone.startsWith("55") ? phone.slice(2) : phone;
	return `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}`;
}

export function locationLink(lat, lng) {
	if (lat === null || lat === undefined || lng === null || lng === undefined || lat === "" || lng === "") return "";
	const a = Number(lat), b = Number(lng);
	return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 ? `https://www.google.com/maps?q=${a},${b}` : "";
}

export function deliveryReady(address, location) {
	if (locationLink(location?.lat, location?.lng)) return true;
	if (/https:\/\/(?:www\.google\.com\/maps|maps\.google\.com\/|maps\.app\.goo\.gl\/|goo\.gl\/maps\/)/i.test(String(address ?? ""))) return true;
	return /\d|sem n[uú]mero|s\/n/i.test(String(address ?? ""));
}