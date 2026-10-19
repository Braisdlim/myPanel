// Proxy local que espacia las peticiones para respetar el límite anónimo de OVHcloud
// AI Endpoints (2 peticiones/minuto por IP y modelo). Uso: node proxy-lento.mjs [puerto] [ms]
// Luego: PAUTA_LLM_URL=http://127.0.0.1:8787/v1 PAUTA_LLM_MODEL=gpt-oss-120b node ../banco/ejecutar.mjs nube
import http from "node:http";
const DESTINO = "https://oai.endpoints.kepler.ai.cloud.ovh.net";
const PUERTO = Number(process.argv[2] ?? 8787), ESPERA = Number(process.argv[3] ?? 31000);
let ultima = 0, cola = Promise.resolve();
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
async function reenviar(path, body) {
  for (let intento = 0; intento < 4; intento++) {
    const hueco = ultima + ESPERA - Date.now(); if (hueco > 0) await dormir(hueco);
    ultima = Date.now();
    const r = await fetch(DESTINO + path, { method: "POST", headers: { "content-type": "application/json" }, body, signal: AbortSignal.timeout(180000) }).catch((e) => ({ status: 599, text: async () => String(e) }));
    if (r.status !== 429 && r.status < 500) return r;
    console.error(new Date().toISOString(), "reintento tras", r.status);
  }
  return { status: 599, text: async () => "sin respuesta tras reintentos" };
}
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  const turno = cola.then(() => reenviar(req.url, body)); cola = turno.catch(() => {});
  const r = await turno; const t = await r.text();
  res.writeHead(r.status, { "content-type": "application/json" }); res.end(t);
}).listen(PUERTO, "127.0.0.1", () => console.error("proxy en", PUERTO, "espera", ESPERA, "ms"));
