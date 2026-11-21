// Connection credentials belong to this installation, never to the distributed ZIP.
const LEGACY_CREDENTIAL_SHA256 = "0360e8c3a5daf1008ed0dc184f68002caa70fa76563e1eec0f0a7df0289c58c0";

export async function configuredGeminiKey(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const fingerprint = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return fingerprint === LEGACY_CREDENTIAL_SHA256 ? "" : key;
}

function panelOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Use o endereço HTTPS do painel da IA, sem usuário ou senha no endereço.");
  return url.origin;
}

export async function aiConnection(config, defaultUrl, storage = globalThis.chrome?.storage?.local) {
  const key = await configuredGeminiKey(config.geminiKey);
  const token = String(config.hubToken || "").trim();
  const url = panelOrigin(config.aiUrl || defaultUrl);
  if (token) return { provider: "panel", url, token };
  // Preserve an explicitly configured Google connection; don't switch models/providers on a failure.
  if (key) return { provider: "gemini", key };
  const saved = (await storage?.get("guisarde-hub"))?.["guisarde-hub"];
  if (saved?.token && saved.url && panelOrigin(saved.url) === url)
    return { provider: "panel", url, token: saved.token };
  throw new Error("IA não conectada. Em Configurações, informe a chave de conexão criada no painel em WhatsApp & teste, ou sua própria chave do Gemini.");
}

export function connectionError(error, connection) {
  let text = String(error?.message || error || "Falha na conexão da IA.");
  for (const secret of [connection?.key, connection?.token].filter(Boolean)) text = text.split(secret).join("[oculto]");
  return text;
}

export async function askPanel(connection, payload, fetchImpl = fetch) {
  const response = await fetchImpl(connection.url + "/api/public/atendente", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + connection.token },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const remedy = response.status === 401 ? "Confira a chave de conexão criada no painel em WhatsApp & teste." : "";
    throw new Error(`Painel IA HTTP ${response.status}: ${result?.error || response.statusText || "falha no atendimento"} ${remedy}`.trim());
  }
  if (!result || typeof result !== "object" || (!result.order && !result.sendMenu && !String(result.reply || "").trim()))
    throw new Error("O painel não retornou uma resposta de atendimento válida. Confira o endereço configurado e o atendimento no painel.");
  return result;
}