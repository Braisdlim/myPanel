// Movimiento (D-057) con animaciones ACTIVADAS: tipo de transición en cada navegación, deslizar en Calendario con el dedo
// (eventos táctiles reales por CDP), bajar una hoja para cerrarla, atajos de teclado y «reducir movimiento».
import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });
const esMovil = (page) => (page.viewportSize()?.width ?? 1440) <= 640;

// Anota el tipo de cada View Transition que arranca la app
async function espiarTransiciones(page) {
  await page.addInitScript(() => {
    window.__transiciones = [];
    const original = document.startViewTransition?.bind(document);
    if (original) document.startViewTransition = (cb) => { window.__transiciones.push(document.documentElement.dataset.transicion); return original(cb); };
  });
}
const transiciones = (page) => page.evaluate(() => window.__transiciones);

// Gesto con el dedo por CDP (genera pointer events de tipo «touch»)
async function deslizarDedo(page, [x0, y0], [x1, y1], pasos = 8) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= pasos; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / pasos, y: y0 + ((y1 - y0) * i) / pasos }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

test("cada navegación lleva su transición: pestañas funden, entrar y volver se deslizan, fechas pasan de lado", async ({ page }) => {
  await espiarTransiciones(page);
  await page.goto("/#/asistente");
  await page.waitForSelector(".app__main .vista");
  if (esMovil(page)) await page.locator(".pa-tab", { hasText: "Calendario" }).click();
  else await page.locator(".pa-side__item", { hasText: "Calendario" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Anterior" }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Año", exact: true }).click(); // cambiar de escala: se funde
  await page.waitForSelector(".pa-year__c[data-hoy]");
  await page.waitForTimeout(400);
  await page.locator(".pa-year__c[data-hoy]").click(); // entrar en un día desde el año
  await page.waitForTimeout(400);
  await page.goBack();
  await expect.poll(() => transiciones(page)).toEqual(["fundido", "siguiente", "anterior", "fundido", "entrar", "salir"]);
  await expect(page.locator("html")).not.toHaveAttribute("data-transicion", /.+/); // se limpia al acabar
});

test("con «reducir movimiento» no hay transiciones", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await espiarTransiciones(page);
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await page.evaluate(() => (location.hash = "#/tareas"));
  await expect(page).toHaveURL(/#\/tareas$/);
  expect(await transiciones(page)).toEqual([]);
});

test("deslizar de lado en Calendario pasa de semana; en vertical o desde el borde, no", async ({ page }) => {
  test.skip(!esMovil(page), "con el dedo, en el móvil");
  await page.goto("/#/calendario/semana/2026-10-21");
  await page.waitForSelector(".deslizable");
  const caja = await page.locator(".deslizable").boundingBox();
  const y = caja.y + 120, w = page.viewportSize().width;
  await deslizarDedo(page, [w * 0.75, y], [w * 0.15, y]); // hacia la izquierda: siguiente
  await expect(page).toHaveURL(/#\/calendario\/semana\/2026-10-28$/);
  await page.waitForTimeout(400);
  await deslizarDedo(page, [w * 0.25, y], [w * 0.85, y]); // hacia la derecha: anterior
  await expect(page).toHaveURL(/#\/calendario\/semana\/2026-10-21$/);
  await page.waitForTimeout(400);
  await deslizarDedo(page, [w * 0.5, y], [w * 0.55, y + 160]); // vertical: desplaza, no cambia
  await deslizarDedo(page, [10, y], [w * 0.7, y]); // desde el borde: es el «atrás» del sistema
  await page.waitForTimeout(400);
  await expect(page).toHaveURL(/#\/calendario\/semana\/2026-10-21$/);
  expect(await page.evaluate(() => history.length)).toBeLessThan(5); // pasar semanas no llena el historial
});

test("una hoja se cierra bajándola con el dedo; si se suelta cerca, vuelve", async ({ page }) => {
  test.skip(!esMovil(page), "con el dedo, en el móvil");
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await page.click(".pa-tab--add");
  const hoja = page.locator('[role="dialog"]');
  await expect(hoja).toBeVisible();
  await page.waitForTimeout(400);
  const caja = await hoja.boundingBox();
  await deslizarDedo(page, [caja.x + caja.width / 2, caja.y + 20], [caja.x + caja.width / 2, caja.y + 60], 4); // poco: vuelve
  await page.waitForTimeout(400);
  await expect(hoja).toBeVisible();
  await deslizarDedo(page, [caja.x + caja.width / 2, caja.y + 20], [caja.x + caja.width / 2, caja.y + 260], 8); // lejos: se cierra
  await expect(hoja).toHaveCount(0);
  await expect(page.locator(".app")).not.toHaveAttribute("inert", "");
});

test("atajos de teclado: Ctrl+número, escalas, hoy, flechas y ? para verlos", async ({ page }) => {
  test.skip(esMovil(page), "teclado, en el escritorio");
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await page.keyboard.press("Control+2");
  await expect(page).toHaveURL(/#\/calendario$/);
  await page.waitForSelector(".deslizable"); // la pantalla entra con su transición
  await page.keyboard.press("s");
  await expect(page).toHaveURL(/#\/calendario\/semana\//);
  const antes = page.url();
  await page.keyboard.press("ArrowRight");
  await expect(page).not.toHaveURL(antes);
  await page.keyboard.press("t");
  await page.keyboard.press("m");
  await expect(page).toHaveURL(/#\/calendario\/mes\//);
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Atajos de teclado" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Control+3");
  await expect(page).toHaveURL(/#\/tareas$/);
});

test("deslizar de lado cambia de sección: Hoy → Calendario → Tareas, y vuelta; el calendario sigue pasando fechas", async ({ page }) => {
  test.skip(!esMovil(page), "con el dedo, en el móvil");
  const w = page.viewportSize().width;
  const izquierda = (y) => deslizarDedo(page, [w * 0.8, y], [w * 0.15, y]);
  const derecha = (y) => deslizarDedo(page, [w * 0.2, y], [w * 0.85, y]);
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await izquierda(300);
  await expect(page).toHaveURL(/#\/calendario$/);
  await page.waitForSelector(".deslizable");
  await page.waitForTimeout(400);
  // Sobre el calendario: pasa fechas y no cambia de sección
  const zona = await page.locator(".deslizable").boundingBox();
  await izquierda(zona.y + 80);
  await expect(page).toHaveURL(/#\/calendario\/(mes|semana)\/\d{4}-/);
  await page.waitForTimeout(400);
  // Sobre la cabecera (el título): cambia de sección
  const cabecera = await page.locator(".fila-titulo").boundingBox();
  await izquierda(cabecera.y + cabecera.height / 2);
  await expect(page).toHaveURL(/#\/tareas$/);
  await page.waitForTimeout(400);
  await derecha(300);
  await expect(page).toHaveURL(/#\/calendario/);
  await page.waitForTimeout(400);
  // Atrás devuelve a la sección anterior, como con las pestañas
  await page.goBack();
  await expect(page).toHaveURL(/#\/tareas$/);
});

test("en los extremos no hay más secciones y con el ajuste apagado no se desliza", async ({ page }) => {
  test.skip(!esMovil(page), "con el dedo, en el móvil");
  const w = page.viewportSize().width;
  await page.goto("/#/asistente");
  await page.waitForSelector(".app__main .vista");
  await deslizarDedo(page, [w * 0.8, 300], [w * 0.15, 300]); // después del Asistente (el último, D-059) no hay nada
  await page.waitForTimeout(400);
  await expect(page).toHaveURL(/#\/asistente$/);
  await page.goto("/#/ajustes/general");
  await page.getByRole("switch", { name: "Deslizar para cambiar de sección" }).click();
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await deslizarDedo(page, [w * 0.8, 300], [w * 0.15, 300]);
  await page.waitForTimeout(400);
  await expect(page).toHaveURL(/#\/hoy$/);
});
