// Mide cada pantalla en tamaños de móvil reales: cuánto sobra de alto (obliga a hacer scroll) y si algo
// se sale por los lados (scroll lateral). No es una prueba: imprime una tabla para decidir qué arreglar.
// Uso: npm run build:pruebas && npx astro preview --port 4330  (en otra terminal)  y  node pruebas/medir-movil.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:4330";
// Alto útil aproximado [I]: Honor 600 Pro (412 de ancho) en Chrome con la barra de direcciones y como app instalada;
// un Android estrecho; iPhone 15 en Safari con barras y como app de pantalla de inicio.
const TAMANOS = [["honor-chrome", 412, 800], ["honor-app", 412, 870], ["estrecho", 360, 700], ["iphone-safari", 390, 664], ["iphone-app", 390, 800]];
const RUTAS = (process.env.RUTAS ?? "hoy,calendario/dia,calendario/semana,calendario/mes,calendario/anio,tareas,tareas/entrada,tareas/programadas,finanzas,finanzas/mundial,atencion,asistente,ajustes/general,ajustes/cuentas,ajustes/privacidad").split(",");

const navegador = await chromium.launch();
const filas = [];
for (const [nombre, ancho, alto] of TAMANOS) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, isMobile: true, hasTouch: true });
  await pagina.emulateMedia({ colorScheme: "dark" });
  for (const ruta of RUTAS) {
    await pagina.goto(`${BASE}/#/${ruta}`);
    await pagina.waitForSelector(".app__main .vista");
    await pagina.waitForTimeout(150);
    const m = await pagina.evaluate(() => {
      const main = document.querySelector(".app__main");
      const fuera = [];
      for (const el of document.querySelectorAll(".app__main *")) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > innerWidth + 1 || r.left < -1)) fuera.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`);
      }
      const lateral = [...document.querySelectorAll(".app__main *")].filter((el) => {
        const s = getComputedStyle(el);
        return /(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 1;
      }).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`);
      return {
        sobra: main.scrollHeight - main.clientHeight, // px de más en vertical
        visible: main.clientHeight,
        doc: document.documentElement.scrollHeight - innerHeight, // la página entera no debería moverse
        fuera: [...new Set(fuera)].slice(0, 3),
        lateral: [...new Set(lateral)].slice(0, 3),
      };
    });
    filas.push({ tamano: nombre, ruta, ...m });
  }
  await pagina.close();
}
await navegador.close();
for (const f of filas) {
  console.log(`${f.tamano.padEnd(14)} ${f.ruta.padEnd(20)} sobra ${String(f.sobra).padStart(5)} de ${f.visible}  doc ${f.doc}${f.fuera.length ? "  FUERA " + f.fuera.join(" ") : ""}${f.lateral.length ? "  LATERAL " + f.lateral.join(" ") : ""}`);
}
