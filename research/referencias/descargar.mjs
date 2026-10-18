// Descarga capturas reales de referencia para un sector.
// Uso: node research/referencias/descargar.mjs <sector>
// Fuentes: API pública de búsqueda de la App Store (capturas oficiales) y páginas oficiales (og:image e <img>).
// Usa curl para respetar el proxy y los certificados del entorno.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const sector = process.argv[2];
const fuentes = JSON.parse(readFileSync(join(here, "fuentes.json"), "utf8"));
if (!fuentes[sector]) { console.error(`Sector desconocido. Opciones: ${Object.keys(fuentes).join(", ")}`); process.exit(1); }

const outDir = join(root, "docs", "referencias", sector, "img");
mkdirSync(outDir, { recursive: true });
const hoy = new Date().toISOString().slice(0, 10);
const manifiesto = [];
const fallos = [];

function curl(url, out) {
  const args = ["-sSL", "--max-time", "30", "-A", "Mozilla/5.0 (Macintosh) myPanel-referencias", "-w", "%{http_code}"];
  if (out) args.push("-o", out); else args.push("-o", "-");
  let res;
  try {
    res = execFileSync("curl", [...args, url], { encoding: "utf8", maxBuffer: 50 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const msg = String(e.stderr || e.message).trim().split("\n")[0];
    throw new Error(/403|CONNECT tunnel/.test(msg) ? "bloqueado por la red del entorno (403)" : msg);
  }
  const code = res.slice(-3);
  if (!code.startsWith("2")) throw new Error(`HTTP ${code}`);
  return out ? null : res.slice(0, -3);
}
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const decode = (u) => u.replace(/&amp;/g, "&").replace(/&#x2F;/g, "/");
// Next.js sirve imágenes redimensionadas: se pide la original
function original(u) {
  const m = u.match(/\/_next\/image\?url=([^&]+)/);
  if (m) { const inner = decodeURIComponent(m[1]); return inner.startsWith("/") ? new URL(inner, u).href : inner; }
  // App Store: pedir la captura a tamaño completo en lugar de la miniatura
  return u.replace(/\/\d+x\d+bb\.(jpg|png|webp)$/, "/2400x0w.$1");
}

function guardar(url, base, meta) {
  url = original(decode(url));
  const ext = (url.match(/\.(png|jpe?g|webp|gif)(\?|$)/i)?.[1] ?? "jpg").toLowerCase();
  const file = `${base}.${ext}`;
  const path = join(outDir, file);
  try {
    try { curl(url, path); } catch { curl(url, path); } // un reintento ante cortes
    if (statSync(path).size < 12_000) return; // iconos y miniaturas: fuera
    manifiesto.push({ archivo: file, url, fecha: hoy, ...meta });
  } catch (e) { fallos.push({ url, error: e.message.split("\n")[0] }); }
}

// 1) App Store
for (const a of fuentes[sector].appstore ?? []) {
  try {
    let r = null;
    if (a.id) {
      const j = JSON.parse(curl(`https://itunes.apple.com/lookup?id=${a.id}&country=${a.country ?? "es"}`));
      r = j.results?.[0];
      if (r && a.seller && !r.sellerName?.includes(a.seller)) r = null;
    }
    if (!r) {
      const j = JSON.parse(curl(`https://itunes.apple.com/search?term=${encodeURIComponent(a.term)}&entity=${a.entity}&country=${a.country ?? "es"}&limit=10`));
      r = j.results?.find((x) => !a.seller || x.sellerName?.includes(a.seller));
    }
    if (!r) { fallos.push({ url: a.app, error: "no encontrada en la App Store" }); continue; }
    const shots = [...(r.screenshotUrls ?? []), ...(r.ipadScreenshotUrls ?? [])];
    shots.forEach((u, i) => guardar(u, `${slug(a.app)}-${String(i + 1).padStart(2, "0")}`, {
      app: a.app, idea: a.idea, fuente: "App Store (captura oficial)", ficha: r.trackViewUrl, version: r.version,
    }));
  } catch (e) { fallos.push({ url: `${a.app} (App Store)`, error: e.message }); }
}

// 2) Páginas oficiales (contador por app para no sobrescribir si varias páginas comparten nombre)
const contador = {};
for (const p of fuentes[sector].paginas ?? []) {
  try {
    const html = curl(p.url);
    const urls = new Set();
    for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/gi)) urls.add(m[1]);
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) urls.add(m[1]);
    let i = 0;
    contador[p.app] ??= 0;
    for (const raw of urls) {
      if (/\.svg(\?|$)|data:|logo|icon|avatar|favicon/i.test(raw)) continue;
      const abs = new URL(raw, p.url).href;
      i++;
      guardar(abs, `${slug(p.app)}-${String(++contador[p.app]).padStart(2, "0")}`, { app: p.app, idea: p.idea, fuente: "Web oficial", pagina: p.url });
      if (i >= 15) break;
    }
  } catch (e) { fallos.push({ url: p.url, error: e.message.split("\n")[0] }); }
}

// 3) Imágenes concretas elegidas a mano
let k = 0;
for (const x of fuentes[sector].directas ?? []) {
  guardar(x.url, `${slug(x.app)}-directa-${String(++k).padStart(2, "0")}`, { app: x.app, idea: x.idea, fuente: "Web oficial (imagen concreta)" });
}

writeFileSync(join(outDir, "manifiesto.json"), JSON.stringify({ sector, fecha: hoy, imagenes: manifiesto, fallos }, null, 2));
console.log(`Imágenes guardadas: ${manifiesto.length}. Fallos: ${fallos.length}.`);
for (const f of fallos) console.log(`  ✗ ${f.url}: ${f.error}`);
