// Horario de trabajo (D-054) con Google imitado: se activa en Ajustes; los días con «Vacaciones» en tu calendario no hay
// trabajo; un «festivo» de Google que no lo es (Carnaval) no cuenta; el trabajo no tapa tus eventos ni es un solape.
// Hace falta compilar con un ID de cliente cualquiera: npm run build:pruebas
import { test, expect } from "@playwright/test";
import { revisar } from "./revisar.js";

test.use({ timezoneId: "Europe/Madrid" });

const YO = "cuenta.uno@gmail.com";
const FESTIVOS = "es.spain#holiday@group.v.calendar.google.com";
const madrid = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(d);
// Lunes, martes y miércoles de la semana que viene (siempre laborables)
const hoy = new Date(); const dl = (hoy.getDay() + 6) % 7;
const dia = (n) => madrid(new Date(hoy.getTime() + (7 - dl + n) * 864e5));
const [LUNES, MARTES, MIERCOLES] = [dia(0), dia(1), dia(2)];
const siguiente = (d) => madrid(new Date(new Date(d + "T12:00:00").getTime() + 864e5));

const CALENDARIOS = [
  { id: YO, summary: YO, primary: true, accessRole: "owner", selected: true },
  { id: FESTIVOS, summary: "Festivos en España", accessRole: "reader", selected: true },
];
const EVENTOS = {
  [YO]: [
    { id: "v1", iCalUID: "v1@g", status: "confirmed", summary: "Vacaciones", start: { date: MARTES }, end: { date: siguiente(MARTES) } },
    { id: "r1", iCalUID: "r1@g", status: "confirmed", summary: "Dentista", start: { dateTime: `${LUNES}T10:30:00` }, end: { dateTime: `${LUNES}T11:30:00` } },
  ],
  [FESTIVOS]: [{ id: "c1", iCalUID: "c1@g", status: "confirmed", summary: "Martes de Carnaval", start: { date: MIERCOLES }, end: { date: siguiente(MIERCOLES) } }],
};
const GSI = `window.google = { accounts: { oauth2: {
  initTokenClient(cfg) { return { requestAccessToken() { setTimeout(() => cfg.callback({ access_token: "tk", expires_in: 3599, scope: cfg.scope }), 20); } }; },
  hasGrantedAllScopes(r, ...s) { return s.every((x) => r.scope.split(" ").includes(x)); }, revoke(t, cb) { cb && cb({}); } } } };`;

test("horario de trabajo: se activa, respeta tus días libres y no tapa tus eventos", async ({ page }, info) => {
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await page.route("https://accounts.google.com/gsi/client", (r) => r.fulfill({ contentType: "text/javascript", body: GSI }));
  await page.route("https://www.googleapis.com/calendar/v3/**", (r) => {
    const url = new URL(r.request().url());
    if (url.pathname.endsWith("/users/me/calendarList")) return r.fulfill({ json: { items: CALENDARIOS } });
    const cal = decodeURIComponent(url.pathname.split("/calendars/")[1].replace(/\/events$/, ""));
    return r.fulfill({ json: { items: EVENTOS[cal] ?? [] } });
  });
  await page.emulateMedia({ colorScheme: "dark" });
  const movil = (page.viewportSize()?.width ?? 1440) <= 640;

  await page.goto("/#/ajustes/cuentas");
  await page.getByRole("button", { name: "Conectar Google", exact: true }).click();
  await expect(page.getByRole("article", { name: `Cuenta ${YO}` })).toContainText("eventos guardados");
  // El festivo de Google se enciende para comprobar que, aun así, no cuenta
  const festivos = page.getByRole("switch", { name: "Mostrar Festivos en España" });
  if ((await festivos.getAttribute("aria-checked")) === "false") await festivos.click();

  // Activar en Ajustes › General
  await page.goto("/#/ajustes/general");
  const sw = page.getByRole("switch", { name: "Mostrar mi horario de trabajo" });
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  await expect(page.getByLabel("Entrada")).toHaveValue("08:00");
  await expect(page.getByLabel("Salida")).toHaveValue("17:30");
  await expect(page.locator(".filas").last()).toContainText("Vacaciones"); // próximos días libres
  await expect(page.locator(".filas").last()).not.toContainText("Carnaval");
  await page.screenshot({ path: `capturas/${info.project.name}-horario-ajustes.png`, fullPage: true });
  expect(await revisar(page), "revisión de accesibilidad").toEqual([]);

  const trabajoDe = (d) => (movil ? page.locator(".pa-dayline__body", { hasText: "Trabajo" }) : page.getByRole("button", { name: "Trabajo, 8:00–17:30" }));
  // Lunes: trabajo, y el dentista sigue a la vista encima
  await page.goto(`/#/calendario/dia/${LUNES}`);
  await expect(trabajoDe(LUNES)).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Dentista/ })).toBeVisible();
  await page.screenshot({ path: `capturas/${info.project.name}-horario-lunes.png` });
  // Martes de vacaciones: sin trabajo
  await page.goto(`/#/calendario/dia/${MARTES}`);
  await expect(page.locator(".app__main")).toContainText("Vacaciones");
  await expect(trabajoDe(MARTES)).toHaveCount(0);
  // Miércoles con un «festivo» de Google que no lo es: se trabaja
  await page.goto(`/#/calendario/dia/${MIERCOLES}`);
  await expect(page.locator(".app__main")).toContainText("Martes de Carnaval");
  await expect(trabajoDe(MIERCOLES)).toHaveCount(1);
  // Ningún aviso de solape por el trabajo
  await page.goto("/#/atencion");
  await expect(page.locator(".app__main")).not.toContainText("Trabajo");
  expect(errores, "errores en la consola").toEqual([]);
});
