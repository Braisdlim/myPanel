// Recorrido completo con dos cuentas de Google, sin tocar Google: la biblioteca de permisos y la API de Calendar
// se sustituyen por imitaciones (page.route). Hace falta compilar con un ID de cliente cualquiera:
//   npm run build:pruebas   (usa el ID falso de .env.pruebas)
import { test, expect } from "@playwright/test";
import { revisar } from "./revisar.js";

test.use({ timezoneId: "Europe/Madrid" });

const UNO = "cuenta.uno@gmail.com", DOS = "cuenta.dos@gmail.com";
const FESTIVOS = "es.spain#holiday@group.v.calendar.google.com";
const madrid = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(d);
const HOY = madrid(new Date());
const MANANA = madrid(new Date(Date.now() + 864e5));
const PASADO = madrid(new Date(Date.now() + 2 * 864e5));

const conHora = (id, uid, titulo, dia, ini, fin, extra = {}) => ({ id, iCalUID: uid, status: "confirmed", summary: titulo, htmlLink: `https://www.google.com/calendar/event?eid=${id}`, start: { dateTime: `${dia}T${ini}:00` }, end: { dateTime: `${dia}T${fin}:00` }, ...extra });
const CALENDARIOS = {
  [UNO]: [{ id: UNO, summary: UNO, primary: true, accessRole: "owner", selected: true }, { id: FESTIVOS, summary: "Festivos en España", accessRole: "reader" }],
  [DOS]: [{ id: DOS, summary: DOS, primary: true, accessRole: "owner", selected: true }],
};
const EVENTOS = {
  [UNO]: [conHora("e1", "e1@google.com", "Comida con el equipo", HOY, "14:00", "15:30", { location: "Bar de abajo" }), conHora("e2", "comun@google.com", "Cena compartida", HOY, "21:00", "22:00")],
  [FESTIVOS]: [{ id: "f1", iCalUID: "f1@google.com", status: "confirmed", summary: "Fiesta local", start: { date: MANANA }, end: { date: PASADO } }],
  [DOS]: [conHora("d1", "d1@google.com", "Llamada con la gestoría", HOY, "14:30", "15:00"), conHora("d2", "comun@google.com", "Cena compartida", HOY, "21:00", "22:00"),
    conHora("d3", "d3@google.com", "Evento cancelado", HOY, "10:00", "11:00", { status: "cancelled" })],
};

// Imitación de google.accounts.oauth2: la primera vez elige UNO, la segunda DOS; con login_hint, esa cuenta.
const GSI = `
  window.__revocados = [];
  window.google = { accounts: { oauth2: {
    initTokenClient(cfg) { return { requestAccessToken() {
      const n = (window.__elegidas = (window.__elegidas || 0) + 1);
      const quien = cfg.login_hint || (n === 1 ? ${JSON.stringify(UNO)} : ${JSON.stringify(DOS)});
      setTimeout(() => cfg.callback({ access_token: "tk|" + quien + "|" + n, expires_in: 3599, scope: cfg.scope, token_type: "Bearer" }), 20);
    } }; },
    hasGrantedAllScopes(r, ...s) { return s.every((x) => r.scope.split(" ").includes(x)); },
    revoke(t, cb) { window.__revocados.push(t); cb && cb({ successful: true }); },
  } } };`;

async function imitarGoogle(page, llamadas) {
  await page.route("https://accounts.google.com/gsi/client", (r) => r.fulfill({ contentType: "text/javascript", body: GSI }));
  await page.route("https://www.googleapis.com/calendar/v3/**", (r) => {
    const quien = (r.request().headers().authorization ?? "").split("|")[1];
    const url = new URL(r.request().url());
    llamadas.push(url.pathname);
    if (!CALENDARIOS[quien]) return r.fulfill({ status: 401, body: "{}" });
    if (url.pathname.endsWith("/users/me/calendarList")) return r.fulfill({ json: { items: CALENDARIOS[quien] } });
    const cal = decodeURIComponent(url.pathname.split("/calendars/")[1].replace(/\/events$/, ""));
    if (!CALENDARIOS[quien].some((c) => c.id === cal)) return r.fulfill({ status: 404, body: "{}" });
    return r.fulfill({ json: { items: EVENTOS[cal] ?? [] } });
  });
}

test("conectar dos cuentas de Google, verlas juntas, recargar y desconectar", async ({ page }, info) => {
  const errores = [], llamadas = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await imitarGoogle(page, llamadas);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

  // 1. Conectar la primera cuenta
  await page.goto("/#/ajustes/cuentas");
  const conectar = page.getByRole("button", { name: "Conectar Google", exact: true });
  await expect(conectar, "compila con PUBLIC_GOOGLE_CLIENT_ID para esta prueba").toBeEnabled();
  await conectar.click();
  const uno = page.getByRole("article", { name: `Cuenta ${UNO}` });
  await expect(uno).toContainText("Google · solo lectura");
  await expect(uno.getByRole("switch", { name: "Mostrar Festivos en España" })).toHaveAttribute("aria-checked", "false");
  await expect(uno).toContainText("2 eventos guardados");
  expect(llamadas.filter((l) => l.includes(encodeURIComponent(FESTIVOS))), "no pide los calendarios apagados").toEqual([]);

  // 2. Conectar la segunda
  await page.getByRole("button", { name: "Conectar otra cuenta de Google" }).click();
  const dos = page.getByRole("article", { name: `Cuenta ${DOS}` });
  await expect(dos).toContainText("2 eventos guardados"); // el cancelado no cuenta

  // 3. Hoy: eventos reales de las dos cuentas, sin los de ejemplo, y la cena compartida una sola vez
  await page.goto("/#/hoy");
  const eventos = page.locator(".eventos");
  await expect(eventos).toContainText("Comida con el equipo");
  await expect(eventos).toContainText("Llamada con la gestoría");
  await expect(eventos).not.toContainText("Revisión del coche");
  await expect(eventos).not.toContainText("Evento cancelado");
  await expect(eventos.getByText("Cena compartida")).toHaveCount(1);

  // 4. Pide atención: el solape entre cuentas sí, la cena compartida no
  await page.goto("/#/atencion");
  await expect(page.locator(".pa-alert", { hasText: "se solapan" })).toHaveCount(1);
  await expect(page.locator(".pa-alert", { hasText: "se solapan" })).toContainText("Comida con el equipo");

  // 5. Detalle del evento compartido
  await page.goto(`/#/calendario/dia/${HOY}`);
  await page.getByRole("button", { name: /Cena compartida/ }).first().click();
  await expect(page.getByText(/También en cuenta\.dos@gmail\.com/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir en Google Calendar" })).toHaveAttribute("href", /eid=e2$/);

  // 6. Recargar: se ve lo guardado sin volver a llamar a Google
  const antes = llamadas.length;
  await page.reload();
  await expect(page.locator(".pa-ev, .linea", { hasText: "Comida con el equipo" }).first()).toBeVisible();
  expect(llamadas.length, "al recargar no se llama a Google").toBe(antes);

  // 7. Capturas y revisión con cuentas reales, en los dos temas
  for (const tema of ["dark", "light"]) {
    await page.emulateMedia({ colorScheme: tema, reducedMotion: "reduce" });
    for (const ruta of ["ajustes/cuentas", "hoy", "calendario/semana", `calendario/dia/${HOY}`]) {
      await page.goto(`/#/${ruta}`);
      await page.reload();
      await page.waitForSelector(".app__main .vista");
      await page.screenshot({ path: `capturas/${info.project.name}-${tema}-google-${ruta.split("/").slice(0, 2).join("_")}.${process.env.FORMAT ?? "png"}` });
      expect(await revisar(page), `revisión de ${ruta} (${tema})`).toEqual([]);
    }
  }

  // 8. Encender un calendario trae sus eventos (pide el permiso con login_hint, sin elegir cuenta)
  await page.goto("/#/ajustes/cuentas");
  await uno.getByRole("switch", { name: "Mostrar Festivos en España" }).click();
  await expect(uno.getByRole("switch", { name: "Mostrar Festivos en España" })).toHaveAttribute("aria-checked", "true");
  await expect(uno).toContainText("3 eventos guardados");
  await page.goto(`/#/calendario/dia/${MANANA}`);
  await expect(page.getByText("Fiesta local").first()).toBeVisible();

  // 9. Desconectar: DOS no tiene permiso vivo (se recargó) y lo dice; UNO sí y se retira
  await page.goto("/#/ajustes/cuentas");
  await dos.getByRole("button", { name: "Desconectar" }).click();
  await expect(dos).toContainText("El permiso de Google se retira en");
  await dos.getByRole("button", { name: "Sí, desconectar" }).click();
  await expect(dos).toHaveCount(0);
  await uno.getByRole("button", { name: "Desconectar" }).click();
  await expect(uno).toContainText("Pauta retirará su permiso en Google");
  await uno.getByRole("button", { name: "Sí, desconectar" }).click();
  await expect(uno).toHaveCount(0);
  expect(await page.evaluate(() => window.__revocados)).toEqual([expect.stringContaining(UNO)]);

  // 10. Sin cuentas vuelven los calendarios de ejemplo
  await page.goto("/#/hoy");
  await expect(page.locator(".eventos")).toContainText("Revisión del coche");
  await page.reload();
  await expect(page.locator(".eventos")).not.toContainText("Comida con el equipo");
  expect(errores, "errores en la consola").toEqual([]);
});

test("si Google falla, se dice en la cuenta y no se pierde lo guardado", async ({ page }) => {
  const llamadas = [];
  await imitarGoogle(page, llamadas);
  await page.goto("/#/ajustes/cuentas");
  await page.getByRole("button", { name: "Conectar Google", exact: true }).click();
  const uno = page.getByRole("article", { name: `Cuenta ${UNO}` });
  await expect(uno).toContainText("2 eventos guardados");
  await page.route("https://www.googleapis.com/calendar/v3/**", (r) => r.fulfill({ status: 503, body: "{}" }));
  await uno.getByRole("button", { name: "Actualizar" }).click();
  await expect(uno.getByRole("alert")).toHaveText("Google Calendar respondió 503.");
  await expect(uno).toContainText("2 eventos guardados");
  await page.goto("/#/hoy");
  await expect(page.locator(".eventos")).toContainText("Comida con el equipo");
});
