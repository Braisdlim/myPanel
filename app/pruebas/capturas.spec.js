// Recorre las pantallas, guarda capturas y comprueba contraste (≥ 4,5:1), objetivos táctiles (≥ 44 px en móvil)
// y que no haya errores en la consola. Las capturas van a capturas/ (fuera del repositorio).
import { test, expect } from "@playwright/test";

const RUTAS = ["hoy", "calendario/dia", "calendario/semana", "calendario/mes", "calendario/anio", "tareas", "tareas/entrada", "tareas/programadas",
  "finanzas", "finanzas/mundial", "atencion", "asistente", "ajustes/general", "ajustes/cuentas", "ajustes/privacidad"];
const TEMAS = (process.env.THEMES ?? "dark,light").split(",");

async function revisar(page) {
  return page.evaluate(() => {
    const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const sobre = (a, b) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
    const fondo = (el) => { const capas = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { capas.push(c); if (c[3] >= 1) break; } } let b = parse(getComputedStyle(document.body).backgroundColor) ?? [0, 0, 0, 1]; for (let i = capas.length - 1; i >= 0; i--) b = sobre(capas[i], b); return b; };
    const opacidad = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
    const malos = []; const vistos = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const t = w.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; const r = el.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight || el.closest("[disabled],[aria-disabled='true'],.espejo") || opacidad(el) < 0.99) continue;
      const cs = getComputedStyle(el); if (cs.color === "rgba(0, 0, 0, 0)") continue;
      const b = fondo(el), f = sobre(parse(cs.color), b); const a = L(f), z = L(b); const cr = (Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05);
      const grande = parseFloat(cs.fontSize) >= 24;
      if (cr < (grande ? 3 : 4.5)) { const k = t.textContent.trim().slice(0, 40); if (!vistos.has(k)) { vistos.add(k); malos.push(`contraste ${cr.toFixed(2)}: «${k}»`); } }
    }
    if (innerWidth <= 640) for (const e of document.querySelectorAll("button, a[href], input, select, textarea")) {
      const r = e.getBoundingClientRect(); if (!r.width || e.closest("[aria-hidden='true']") || e.matches(".pa-check, .pa-switch, .pa-year__c, .pa-chip__x") || e.disabled) continue;
      if (r.bottom < 0 || r.top > innerHeight) continue;
      if (r.height < 44) malos.push(`táctil ${Math.round(r.width)}×${Math.round(r.height)}: «${(e.getAttribute("aria-label") || e.textContent || e.placeholder || "").trim().slice(0, 30)}»`);
    }
    return malos;
  });
}

for (const tema of TEMAS) {
  for (const ruta of RUTAS) {
    test(`${ruta} · ${tema}`, async ({ page }, info) => {
      const errores = [];
      page.on("pageerror", (e) => errores.push(e.message));
      page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
      await page.addInitScript((t) => localStorage.setItem("pauta-tema", t), tema);
      await page.goto(`/#/${ruta}`);
      await page.waitForSelector(".app__main .vista");
      await page.screenshot({ path: `capturas/${info.project.name}-${tema}-${ruta.replace(/\//g, "_")}.${process.env.FORMAT ?? "png"}` });
      const malos = await revisar(page);
      expect(errores, "errores en la consola").toEqual([]);
      expect(malos, "revisión de accesibilidad").toEqual([]);
    });
  }
}

test("apuntar una tarea con una duda y guardarla", async ({ page }) => {
  await page.goto("/#/tareas/entrada");
  await page.waitForSelector(".app__main .vista");
  const movil = (page.viewportSize()?.width ?? 1440) <= 640;
  if (movil) await page.click(".pa-tab--add"); else await page.keyboard.press("Control+k");
  await page.fill("#apuntar-campo", "Llamar a la gestoría pasado mañana a las 9");
  await expect(page.locator(".pa-capture__ask")).toContainText("9:00 de la mañana");
  await expect(page.getByRole("button", { name: "Guardar tarea" })).toBeDisabled();
  await page.getByRole("button", { name: "9:00", exact: true }).click();
  await page.getByRole("button", { name: "Guardar tarea" }).click();
  await page.goto("/#/tareas/programadas");
  await expect(page.locator(".pa-row__title", { hasText: "Llamar a la gestoría" })).toBeVisible();
  await page.reload();
  await expect(page.locator(".pa-row__title", { hasText: "Llamar a la gestoría" })).toBeVisible(); // sigue tras recargar
});
