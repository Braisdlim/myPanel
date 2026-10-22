// Accesibilidad automática con axe-core (D-056): todas las pantallas en oscuro y claro, más las hojas abiertas.
// Reglas WCAG 2.2 A y AA y buenas prácticas. Lo que axe no ve (orden de lectura, sentido del texto) se revisa a mano.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const RUTAS = ["hoy", "calendario/dia", "calendario/semana", "calendario/mes", "calendario/anio", "tareas", "tareas/entrada", "tareas/programadas",
  "finanzas", "finanzas/mundial", "atencion", "asistente", "ajustes", "ajustes/general", "ajustes/cuentas", "ajustes/privacidad"];

async function analizar(page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

for (const tema of ["dark", "light"]) {
  test(`axe en todas las pantallas · ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema });
    const fallos = [];
    for (const ruta of RUTAS) {
      await page.goto(`/#/${ruta}`);
      await page.waitForSelector(".app__main .vista");
      fallos.push(...(await analizar(page)).map((f) => `${ruta}: ${f}`));
    }
    expect(fallos).toEqual([]);
  });
}

test("axe con las hojas abiertas (Apuntar y un evento)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  const movil = (page.viewportSize()?.width ?? 1440) <= 640;
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  if (movil) await page.click(".pa-tab--add"); else await page.keyboard.press("Control+k");
  await page.fill("#apuntar-campo", "Dentista el martes a las 10:30");
  const fallos = (await analizar(page)).map((f) => `apuntar: ${f}`);
  await page.keyboard.press("Escape");
  await page.goto("/#/calendario/dia");
  await page.waitForSelector(".app__main .vista");
  await page.locator(movil ? ".pa-dayline__body" : ".pa-ev").first().click();
  fallos.push(...(await analizar(page)).map((f) => `evento: ${f}`));
  expect(fallos).toEqual([]);
});
