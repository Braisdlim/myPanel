// Paso 3 bis con Google imitado (no llama a Google): «No voy esta vez» en un calendario compartido (solo Pauta),
// «Saltar esta vez» y «Mover esta vez» en una serie de tu calendario, con tarjeta, cuenta a la vista y relectura.
// Hace falta compilar con un ID de cliente cualquiera: npm run build:pruebas
import { test, expect } from "@playwright/test";
import { revisar } from "./revisar.js";

test.use({ timezoneId: "Europe/Madrid" });

const YO = "cuenta.uno@gmail.com";
const madrid = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(d);
const DIA = madrid(new Date(Date.now() + 2 * 864e5));
const SEMANA = madrid(new Date(Date.now() + 9 * 864e5));

const CALENDARIOS = [
  { id: YO, summary: YO, primary: true, accessRole: "owner", selected: true },
  { id: "banda@group", summary: "Agenda de la banda", accessRole: "reader", selected: true },
];
const conHora = (id, titulo, dia, ini, fin, extra = {}) => ({ id, iCalUID: `${id.split("_")[0]}@google.com`, status: "confirmed", summary: titulo, start: { dateTime: `${dia}T${ini}:00` }, end: { dateTime: `${dia}T${fin}:00` }, ...extra });
const nuevosEventos = () => ({
  "banda@group": { e1: conHora("e1", "Ensayo General | Banda de Música", DIA, "21:30", "23:30") },
  [YO]: {
    padel_1: conHora("padel_1", "Pádel", DIA, "19:00", "20:30", { recurringEventId: "padel" }),
    padel_2: conHora("padel_2", "Pádel", SEMANA, "19:00", "20:30", { recurringEventId: "padel" }),
  },
});

const GSI = `
  window.google = { accounts: { oauth2: {
    initTokenClient(cfg) { return { requestAccessToken() {
      setTimeout(() => cfg.callback({ access_token: "tk|" + (cfg.scope.includes("events.owned") ? "w" : "r"), expires_in: 3599, scope: cfg.scope, token_type: "Bearer" }), 20);
    } }; },
    hasGrantedAllScopes(r, ...s) { return s.every((x) => r.scope.split(" ").includes(x)); },
    revoke(t, cb) { cb && cb({ successful: true }); },
  } } };`;

async function imitarGoogle(page, eventos, cambios) {
  await page.route("https://accounts.google.com/gsi/client", (r) => r.fulfill({ contentType: "text/javascript", body: GSI }));
  await page.route("https://www.googleapis.com/calendar/v3/**", async (r) => {
    const req = r.request(), url = new URL(req.url());
    if (url.pathname.endsWith("/users/me/calendarList")) return r.fulfill({ json: { items: CALENDARIOS } });
    const [, cal, id] = url.pathname.match(/\/calendars\/([^/]+)\/events(?:\/([^/]+))?$/) ?? [];
    const calId = decodeURIComponent(cal), evId = id && decodeURIComponent(id);
    const delCal = eventos[calId] ?? {};
    if (req.method() === "PATCH") {
      if (!(req.headers().authorization ?? "").endsWith("|w") || calId !== YO) return r.fulfill({ status: 403, body: "{}" });
      cambios.push({ calId, evId, cuerpo: req.postDataJSON(), sendUpdates: url.searchParams.get("sendUpdates") });
      delCal[evId] = { ...delCal[evId], ...req.postDataJSON() };
      return r.fulfill({ json: delCal[evId] });
    }
    if (evId === "padel") return r.fulfill({ json: { id: "padel", status: "confirmed", summary: "Pádel" } }); // la serie
    if (evId) return delCal[evId] ? r.fulfill({ json: delCal[evId] }) : r.fulfill({ status: 404, body: "{}" });
    return r.fulfill({ json: { items: Object.values(delCal).filter((e) => e.status !== "cancelled") } });
  });
}

const abrirEvento = (page, nombre) => page.getByRole("button", { name: new RegExp(`^${nombre}`) }).first().click();

test("cambiar solo esta vez: no voy, saltar y mover, con confirmación y relectura", async ({ page }, info) => {
  const errores = [], cambios = [], eventos = nuevosEventos();
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await imitarGoogle(page, eventos, cambios);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

  await page.goto("/#/ajustes/cuentas");
  await page.getByRole("button", { name: "Conectar Google", exact: true }).click();
  const cuenta = page.getByRole("article", { name: `Cuenta ${YO}` });
  await expect(cuenta).toContainText("2 eventos guardados");

  // 1. Ensayo en un calendario compartido: solo «No voy esta vez», que no escribe en Google
  await page.goto(`/#/calendario/dia/${DIA}`);
  await abrirEvento(page, "Ensayo General");
  await expect(page.getByText("Este calendario no es tuyo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mover esta vez" })).toHaveCount(0);
  await page.getByRole("button", { name: "No voy esta vez" }).click();
  await expect(page.getByText(/No vas este/)).toBeVisible();
  await page.screenshot({ path: `capturas/${info.project.name}-paso3bis-novoy.png` });
  expect(await revisar(page), "revisión de accesibilidad").toEqual([]);
  await page.reload();
  await page.waitForSelector(".app__main .vista");
  await abrirEvento(page, "Ensayo General");
  await expect(page.getByRole("button", { name: "Sí voy" })).toBeVisible(); // sigue marcado tras recargar
  await page.getByRole("button", { name: "Sí voy" }).click();
  await expect(page.getByRole("button", { name: "No voy esta vez" })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1440) <= 640) await page.getByRole("button", { name: "Cerrar" }).click();
  expect(cambios, "«No voy esta vez» no escribe en Google").toEqual([]);

  // 2. Serie en tu calendario, sin «Crear eventos»: explica cómo activarlo
  await abrirEvento(page, "Pádel");
  await expect(page.getByText("activa «Crear eventos»")).toBeVisible();
  await page.goto("/#/ajustes/cuentas");
  await cuenta.getByRole("switch", { name: `Crear eventos en ${YO}` }).click();
  await expect(cuenta).toContainText("Google · crea eventos");

  // 3. Saltar esta vez: tarjeta con la cuenta; solo el clic en «Saltar en …» escribe
  await page.goto(`/#/calendario/dia/${DIA}`);
  await abrirEvento(page, "Pádel");
  await page.getByRole("button", { name: "Saltar esta vez" }).click();
  await expect(page.locator(".confirmar")).toContainText("Se quitará solo el");
  await expect(page.locator(".confirmar")).toContainText("El resto de la serie sigue igual");
  expect(cambios).toEqual([]);
  await page.screenshot({ path: `capturas/${info.project.name}-paso3bis-saltar.png` });
  await page.getByRole("button", { name: `Saltar en ${YO}` }).click();
  await expect(page.locator(".hecho")).toContainText("Saltado y comprobado en Google");
  expect(cambios).toEqual([{ calId: YO, evId: "padel_1", cuerpo: { status: "cancelled" }, sendUpdates: "none" }]);
  if ((page.viewportSize()?.width ?? 1440) <= 640) await page.getByRole("button", { name: "Cerrar" }).click();
  await expect(page.getByRole("button", { name: /^Pádel/ })).toHaveCount(0); // ya no está ese día

  // 4. Mover esta vez: huecos libres de la misma duración; tarjeta; relectura
  await page.goto(`/#/calendario/dia/${SEMANA}`);
  await abrirEvento(page, "Pádel");
  await page.getByRole("button", { name: "Mover esta vez" }).click();
  const huecos = page.locator(".opciones .pa-chip");
  await expect(huecos.first()).toContainText("19:00–20:30");
  await huecos.first().click();
  await expect(page.locator(".confirmar")).toContainText("Se cambiará solo el");
  await page.screenshot({ path: `capturas/${info.project.name}-paso3bis-mover.png` });
  expect(await revisar(page), "revisión de accesibilidad").toEqual([]);
  await page.getByRole("button", { name: `Mover en ${YO}` }).click();
  await expect(page.locator(".hecho")).toContainText("Movido y comprobado en Google");
  expect(cambios).toHaveLength(2);
  expect(cambios[1].evId).toBe("padel_2");
  expect(Object.keys(cambios[1].cuerpo).sort()).toEqual(["end", "start"]); // solo las horas
  expect(cambios[1].cuerpo.start.timeZone).toBe("Europe/Madrid");
  expect(errores, "errores en la consola").toEqual([]);
});
