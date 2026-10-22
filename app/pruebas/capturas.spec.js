// Recorre las pantallas, guarda capturas y comprueba contraste (≥ 4,5:1), objetivos táctiles (≥ 44 px en móvil)
// y que no haya errores en la consola. Las capturas van a capturas/ (fuera del repositorio).
import { test, expect } from "@playwright/test";
import { revisar } from "./revisar.js";

const RUTAS = ["hoy", "calendario/dia", "calendario/semana", "calendario/mes", "calendario/anio", "tareas", "tareas/entrada", "tareas/programadas",
  "finanzas", "finanzas/mundial", "atencion", "asistente", "ajustes/general", "ajustes/cuentas", "ajustes/privacidad"];
const TEMAS = (process.env.THEMES ?? "dark,light").split(",");

for (const tema of TEMAS) {
  for (const ruta of RUTAS) {
    test(`${ruta} · ${tema}`, async ({ page }, info) => {
      const errores = [];
      page.on("pageerror", (e) => errores.push(e.message));
      page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
      // El tema por defecto es «del sistema»: se emula el del sistema (localStorage solo evita el parpadeo inicial)
      await page.emulateMedia({ colorScheme: tema, reducedMotion: "reduce" });
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
