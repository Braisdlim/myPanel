// Genera los iconos PNG de la app instalable (manifiesto y iPhone) desde los logotipos del sistema de diseño.
// Uso: node scripts/iconos.mjs   (necesita el Chromium de Playwright: npx playwright install chromium)
import { chromium } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const LOGO = new URL("../../diseno/sistema/assets/Logo/", import.meta.url);
const SALIDA = new URL("../public/iconos/", import.meta.url);
const icono = await readFile(new URL("pauta-icono.svg", LOGO), "utf8"); // con esquinas redondeadas (propósito «any»)
const frente = await readFile(new URL("pauta-android-frente.svg", LOGO), "utf8"); // capa frontal, zona segura 66 de 108
const FONDO = "linear-gradient(#202128, #0E0F13)"; // el mismo degradado grafito del icono

// Lo que se pinta en cada PNG: el icono tal cual, o la capa frontal a sangre sobre el fondo (Android la recorta; iOS redondea solo)
const PIEZAS = [
  ["pauta-192.png", 192, icono, null],
  ["pauta-512.png", 512, icono, null],
  ["pauta-adaptable-512.png", 512, frente, FONDO],
  ["apple-touch-icon.png", 180, frente, FONDO],
];

await mkdir(SALIDA, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ deviceScaleFactor: 1 });
for (const [nombre, lado, svg, fondo] of PIEZAS) {
  await pagina.setViewportSize({ width: lado, height: lado });
  const dibujo = svg.replace(/<!--.*?-->/s, "").replace(/width="\d+" height="\d+"/, `width="${lado}" height="${lado}"`);
  await pagina.setContent(`<html><body style="margin:0;background:${fondo ?? "transparent"}">${dibujo}</body></html>`);
  await pagina.screenshot({ path: fileURLToPath(new URL(nombre, SALIDA)), omitBackground: !fondo, clip: { x: 0, y: 0, width: lado, height: lado } });
  console.log("hecho", nombre);
}
await navegador.close();
