// Navegación como en una app nativa (D-056): atrás y adelante llevan a la pantalla correcta, las hojas se cierran con
// Esc (y con «atrás» de Android vía CloseWatcher, que Playwright no puede pulsar) y el foco va donde debe.
import { test, expect } from "@playwright/test";

const esMovil = (page) => (page.viewportSize()?.width ?? 1440) <= 640;
const abrirApuntar = async (page) => (esMovil(page) ? page.click(".pa-tab--add") : page.keyboard.press("Control+k"));

test("pasar semanas no llena el historial: atrás vuelve a la pantalla anterior", async ({ page }) => {
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await (esMovil(page) ? page.locator(".pa-tab", { hasText: "Calendario" }).click() : page.locator(".pa-side__item", { hasText: "Calendario" }).click());
  await page.getByRole("button", { name: "Semana" }).click();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page).toHaveURL(/#\/calendario\/semana\/\d{4}-/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/hoy$/);
  await page.goForward();
  await expect(page).toHaveURL(/#\/calendario\/semana\//); // adelante vuelve a la última semana vista
});

test("entrar en un día desde el mes y volver con atrás", async ({ page }) => {
  test.skip(esMovil(page), "en el móvil, tocar un día del mes lo elige en la misma pantalla");
  await page.goto("/#/calendario/mes");
  await page.waitForSelector(".mes");
  await page.locator(".mes__dia").nth(10).click();
  await expect(page).toHaveURL(/#\/calendario\/dia\//);
  await page.goBack();
  await expect(page).toHaveURL(/#\/calendario\/mes$/);
});

test("Esc cierra Apuntar, el fondo queda inerte mientras está abierta y el foco vuelve a su botón", async ({ page }) => {
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  const boton = esMovil(page) ? page.locator(".pa-tab--add") : page.locator(".pa-search");
  await boton.focus();
  await boton.press("Enter");
  await expect(page.locator("#apuntar-campo")).toBeFocused();
  await expect(page.locator(".app")).toHaveAttribute("inert", "");
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab"); // Tab no sale de la hoja
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#apuntar-campo")).toHaveCount(0);
  await expect(page.locator(".app")).not.toHaveAttribute("inert", "");
  await expect(boton).toBeFocused();
});

test("atrás con Apuntar abierta la cierra y no la deja tapando la pantalla", async ({ page }) => {
  await page.goto("/#/hoy");
  await page.waitForSelector(".app__main .vista");
  await page.evaluate(() => (location.hash = "#/tareas"));
  await abrirApuntar(page);
  await expect(page.locator("#apuntar-campo")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/hoy$/);
  await expect(page.locator("#apuntar-campo")).toHaveCount(0);
  await expect(page.locator(".app")).not.toHaveAttribute("inert", "");
});

test("cada pantalla recuerda dónde estabas al volver; al cambiar, el foco va al título", async ({ page }) => {
  test.skip(!esMovil(page), "el desplazamiento largo se da en el móvil");
  await page.goto("/#/calendario/semana");
  await page.waitForSelector(".app__main .vista");
  await page.evaluate(() => document.querySelector(".app__main").scrollTo(0, 400));
  const antes = await page.evaluate(() => document.querySelector(".app__main").scrollTop);
  expect(antes).toBeGreaterThan(300);
  await page.locator(".pa-tab", { hasText: "Tareas" }).click();
  await expect(page).toHaveURL(/#\/tareas$/);
  await expect(page.locator(".app__main h1").first()).toBeFocused();
  await expect(page).toHaveTitle("Tareas · Pauta");
  expect(await page.evaluate(() => document.querySelector(".app__main").scrollTop)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/#\/calendario\/semana$/);
  await expect.poll(() => page.evaluate(() => document.querySelector(".app__main").scrollTop)).toBe(antes);
});

test("año en el móvil: tocar la rejilla abre ese día y cada mes es un botón accesible", async ({ page }) => {
  test.skip(!esMovil(page), "solo en el móvil");
  await page.goto("/#/calendario/anio");
  await page.waitForSelector(".pa-year");
  const celda = page.locator(".pa-year__c[data-iso]").nth(40);
  const iso = await celda.getAttribute("data-iso");
  await celda.click();
  await expect(page).toHaveURL(new RegExp(`#/calendario/dia/${iso}$`));
  await page.goBack();
  await page.getByRole("button", { name: "Abrir marzo" }).click();
  await expect(page).toHaveURL(/#\/calendario\/mes\/\d{4}-03-01$/);
});
