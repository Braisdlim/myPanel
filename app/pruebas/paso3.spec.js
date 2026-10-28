// Paso 3 con Google imitado (no llama a Google): activar «Crear eventos», apuntar «dentista…», elegir la cuenta,
// confirmar con «Crear en …», releer y ver el evento; y el ensayo repetido en tres calendarios se ve una vez.
// Hace falta compilar con un ID de cliente cualquiera: npm run build:pruebas
import { test, expect } from "@playwright/test";
import { revisar } from "./revisar.js";

test.use({ timezoneId: "Europe/Madrid" });

const YO = "cuenta.uno@gmail.com";
const ESCRITURA = "https://www.googleapis.com/auth/calendar.events.owned";
const madrid = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(d);
const HOY = madrid(new Date());
const PASADO = madrid(new Date(Date.now() + 2 * 864e5));

const CALENDARIOS = [
  { id: YO, summary: YO, primary: true, accessRole: "owner", selected: true },
  { id: "familia@group", summary: "Familia", accessRole: "owner", selected: true },
  { id: "glis1@group", summary: "Agenda de la banda", accessRole: "reader", selected: true },
  { id: "glis2@group", summary: "Agenda de la banda", accessRole: "reader", selected: true },
  { id: "banda@gmail.com", summary: "banda@gmail.com", accessRole: "reader", selected: true },
];
const ensayo = (id, titulo, fin) => ({ id, iCalUID: `${id}@google.com`, status: "confirmed", summary: titulo, start: { dateTime: `${HOY}T21:30:00` }, end: { dateTime: fin } });
const EVENTOS = {
  "glis1@group": [ensayo("g1", "Ensayo General | Banda de Música", `${HOY}T23:30:00`)],
  "glis2@group": [ensayo("g2", "Ensayo General | Banda de Música", `${HOY}T23:30:00`)],
  "banda@gmail.com": [ensayo("b1", "Ensayo General", `${madrid(new Date(Date.now() + 864e5))}T00:00:00`)],
};

const GSI = `
  window.__ambitos = [];
  window.google = { accounts: { oauth2: {
    initTokenClient(cfg) { return { requestAccessToken() {
      window.__ambitos.push(cfg.scope);
      setTimeout(() => cfg.callback({ access_token: "tk|" + ${JSON.stringify(YO)} + "|" + (cfg.scope.includes("events.owned") ? "w" : "r"), expires_in: 3599, scope: cfg.scope, token_type: "Bearer" }), 20);
    } }; },
    hasGrantedAllScopes(r, ...s) { return s.every((x) => r.scope.split(" ").includes(x)); },
    revoke(t, cb) { cb && cb({ successful: true }); },
  } } };`;

async function imitarGoogle(page, creados) {
  await page.route("https://accounts.google.com/gsi/client", (r) => r.fulfill({ contentType: "text/javascript", body: GSI }));
  await page.route("https://www.googleapis.com/calendar/v3/**", async (r) => {
    const req = r.request(), url = new URL(req.url());
    const puedeEscribir = (req.headers().authorization ?? "").endsWith("|w");
    if (url.pathname.endsWith("/users/me/calendarList")) return r.fulfill({ json: { items: CALENDARIOS } });
    const [, cal, id] = url.pathname.match(/\/calendars\/([^/]+)\/events(?:\/([^/]+))?$/) ?? [];
    const calId = decodeURIComponent(cal);
    if (req.method() === "POST") {
      if (!puedeEscribir) return r.fulfill({ status: 403, body: "{}" });
      const cuerpo = req.postDataJSON();
      const nuevo = { ...cuerpo, id: `nuevo${creados.length + 1}`, iCalUID: `nuevo${creados.length + 1}@google.com`, status: "confirmed", htmlLink: "https://www.google.com/calendar/event?eid=nuevo" };
      creados.push({ calId, cuerpo, nuevo });
      return r.fulfill({ json: nuevo });
    }
    if (id) return r.fulfill({ json: creados.find((c) => c.nuevo.id === decodeURIComponent(id))?.nuevo ?? { status: "cancelled" } });
    return r.fulfill({ json: { items: [...(EVENTOS[calId] ?? []), ...creados.filter((c) => c.calId === calId).map((c) => c.nuevo)] } });
  });
}

test("el ensayo en tres calendarios se ve una vez, y crear un evento con confirmación y relectura", async ({ page }, info) => {
  const errores = [], creados = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await imitarGoogle(page, creados);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  const movil = (page.viewportSize()?.width ?? 1440) <= 640;

  // Conectar: solo lectura, sin el permiso de escribir
  await page.goto("/#/ajustes/cuentas");
  await page.getByRole("button", { name: "Conectar Google", exact: true }).click();
  const cuenta = page.getByRole("article", { name: `Cuenta ${YO}` });
  await expect(cuenta).toContainText("Google · solo lectura");
  expect(await page.evaluate(() => window.__ambitos.at(-1))).not.toContain("events.owned");

  // El ensayo, una vez
  await page.goto("/#/hoy");
  await expect(page.locator(".eventos")).toContainText("Ensayo General");
  expect(await page.locator(".eventos").getByText("Ensayo General").count()).toBe(1);

  // Sin escritura, Apuntar guarda tareas y explica cómo activarlo
  if (movil) await page.click(".pa-tab--add"); else await page.keyboard.press("Control+k");
  await page.fill("#apuntar-campo", "Dentista pasado mañana a las 10:30");
  await page.getByRole("button", { name: "10:30", exact: true }).click(); // «10:30» es ambiguo: Pauta pregunta
  await expect(page.locator(".pa-capture__preview")).toContainText("activa «Crear eventos»");
  await page.keyboard.press("Escape");

  // Activar «Crear eventos»: pide el permiso aparte
  await page.goto("/#/ajustes/cuentas");
  const interruptor = cuenta.getByRole("switch", { name: `Crear eventos en ${YO}` });
  await expect(interruptor).toHaveAttribute("aria-checked", "false");
  await interruptor.click();
  await expect(interruptor).toHaveAttribute("aria-checked", "true");
  await expect(cuenta).toContainText("Google · crea eventos");
  expect(await page.evaluate(() => window.__ambitos.at(-1))).toContain("events.owned");
  await page.screenshot({ path: `capturas/${info.project.name}-paso3-cuentas.png`, fullPage: true });

  // Apuntar: pregunta dónde; con la cuenta elegida, la tarjeta nombra cuenta, calendario, día y hora
  await page.goto("/#/hoy");
  if (movil) await page.click(".pa-tab--add"); else await page.keyboard.press("Control+k");
  await page.fill("#apuntar-campo", "Dentista pasado mañana a las 10:30");
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await expect(page.locator(".destino")).toContainText("¿Dónde lo guardo?");
  await expect(page.getByRole("button", { name: "Elige dónde" })).toBeDisabled();
  await page.getByRole("button", { name: `Evento en ${YO}` }).click();
  const tarjeta = page.locator(".confirmar");
  await expect(tarjeta).toContainText("«Dentista»");
  await expect(tarjeta).toContainText("10:30–11:30");
  await expect(tarjeta).toContainText(YO);
  await expect(tarjeta.getByRole("combobox")).toHaveValue(YO); // dos calendarios tuyos: se puede elegir; el principal por defecto
  expect(creados, "Enter no crea: lleva al botón").toEqual([]);
  await page.locator("#apuntar-campo").press("Enter");
  expect(creados).toEqual([]);
  await expect(page.getByRole("button", { name: `Crear en ${YO}` })).toBeFocused();
  await page.screenshot({ path: `capturas/${info.project.name}-paso3-confirmar.png` });
  expect(await revisar(page), "revisión de accesibilidad").toEqual([]);

  await page.getByRole("button", { name: `Crear en ${YO}` }).click();
  await expect(page.locator(".hecho")).toContainText("Creado y comprobado en Google");
  expect(creados).toHaveLength(1);
  expect(creados[0].calId).toBe(YO);
  expect(creados[0].cuerpo).toEqual({ summary: "Dentista", description: "Creado desde Pauta.",
    start: { dateTime: `${PASADO}T10:30:00`, timeZone: "Europe/Madrid" }, end: { dateTime: `${PASADO}T11:30:00`, timeZone: "Europe/Madrid" } });
  await page.screenshot({ path: `capturas/${info.project.name}-paso3-creado.png` });
  await page.getByRole("button", { name: "Listo" }).click();

  // Aparece en el calendario sin esperar a «Actualizar», y sigue tras recargar
  await page.goto(`/#/calendario/dia/${PASADO}`);
  await expect(page.locator(".app__main")).toContainText("Dentista");
  await page.reload();
  await expect(page.locator(".app__main")).toContainText("Dentista");
  expect(errores, "errores en la consola").toEqual([]);
});
