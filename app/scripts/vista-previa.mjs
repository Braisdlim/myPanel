// Prepara dist/ como vista previa publicable (página privada de claude.ai): rutas relativas y sin
// <!doctype>, <html>, <head> ni <body>, que pone el visor. Uso: npm run build && node scripts/vista-previa.mjs <carpeta>
import { cpSync, readFileSync, writeFileSync, readdirSync, rmSync, renameSync } from "node:fs";
import { join } from "node:path";

const destino = process.argv[2];
if (!destino) { console.error("Falta la carpeta de destino"); process.exit(1); }
rmSync(destino, { recursive: true, force: true });
cpSync("dist", destino, { recursive: true });

// El visor reserva los nombres que empiezan por «_»: _astro pasa a recursos
const astro = join(destino, "recursos");
renameSync(join(destino, "_astro"), astro);
for (const f of readdirSync(astro)) {
  const p = join(astro, f);
  if (f.endsWith(".css")) writeFileSync(p, readFileSync(p, "utf8").replaceAll("url(/_astro/", "url(./"));
  if (f.endsWith(".js")) writeFileSync(p, readFileSync(p, "utf8").replaceAll('"/_astro/', '"./'));
}
let html = readFileSync(join(destino, "index.html"), "utf8").replaceAll('"/_astro/', '"./recursos/');
html = html.replace(/<!doctype html>/i, "").replace(/<html[^>]*>/i, "").replace(/<\/html>/i, "")
  .replace(/<head>/i, "").replace(/<\/head>/i, "").replace(/<body>/i, "").replace(/<\/body>/i, "")
  .replace(/<meta charset="utf-8"\s*\/?>/i, "").replace(/<meta name="viewport"[^>]*>/i, "");
writeFileSync(join(destino, "index.html"), html.trim() + "\n");
console.log("Vista previa en", destino);
