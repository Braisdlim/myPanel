// Google Calendar desde el navegador y sin servidor (research/google-calendar/notas.md).
// Lectura siempre; crear eventos solo en las cuentas donde lo activas (D-050). La biblioteca de Google da un
// token de acceso de corta duración; Pauta no guarda tokens en disco.
import { aISO, sumarDias } from "./fechas.js";

// ID de cliente del proyecto «proyecto-pauta» de Google Cloud. Es público por diseño (va en la página y no hay
// secreto); el usuario pidió subirlo al repositorio el 20-10-2026 (D-040). PUBLIC_GOOGLE_CLIENT_ID en app/.env lo sustituye.
const ID_DEL_PROYECTO = "1035846726614-g3k1ctssie46vend4ihglf5ujbgef7fr.apps.googleusercontent.com";
export const CLIENT_ID = import.meta.env?.PUBLIC_GOOGLE_CLIENT_ID || ID_DEL_PROYECTO;
export const PERMISOS = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly", // la lista de tus calendarios
  "https://www.googleapis.com/auth/calendar.events.readonly", // ver los eventos, sin poder cambiarlos
];
// Crear eventos solo en calendarios tuyos (no en los compartidos contigo). Se pide aparte, al activarlo en una cuenta.
export const PERMISO_ESCRITURA = "https://www.googleapis.com/auth/calendar.events.owned";
const API = "https://www.googleapis.com/calendar/v3";

let carga;
export function cargarBiblioteca() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  carga ??= new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => { carga = null; mal(new Error("No se pudo cargar la biblioteca de Google. ¿Hay conexión?")); };
    document.head.append(s);
  });
  return carga;
}

/**
 * Pide un token. Con `correo`, salta la elección de cuenta; sin él, deja elegir otra cuenta. Con `escritura`,
 * pide también el permiso de crear eventos. Debe llamarse desde un clic.
 */
export async function pedirToken({ correo = null, escritura = false } = {}) {
  if (!CLIENT_ID) throw new Error("Falta el ID de cliente de Google (PUBLIC_GOOGLE_CLIENT_ID en app/.env).");
  await cargarBiblioteca();
  const oauth = globalThis.google.accounts.oauth2;
  const permisos = escritura ? [...PERMISOS, PERMISO_ESCRITURA] : PERMISOS;
  return new Promise((ok, mal) => {
    const cliente = oauth.initTokenClient({
      client_id: CLIENT_ID,
      scope: permisos.join(" "),
      ...(correo ? { login_hint: correo } : {}),
      callback: (r) => {
        if (r.error) return mal(new Error(r.error === "access_denied" ? "Has cancelado el permiso." : `Google respondió: ${r.error}`));
        if (!oauth.hasGrantedAllScopes(r, ...PERMISOS)) return mal(new Error("Hace falta marcar los dos permisos de calendario para conectar."));
        if (escritura && !oauth.hasGrantedAllScopes(r, PERMISO_ESCRITURA)) return mal(new Error("Para crear eventos hace falta marcar el permiso «crear, cambiar y eliminar eventos» en la ventana de Google."));
        ok({ token: r.access_token, caduca: Date.now() + (Number(r.expires_in) - 60) * 1000, escritura });
      },
      error_callback: (e) => mal(new Error(e?.type === "popup_closed" ? "Se cerró la ventana de Google." : e?.type === "popup_failed_to_open" ? "El navegador bloqueó la ventana de Google." : "No se pudo abrir la ventana de Google.")),
    });
    cliente.requestAccessToken({ prompt: correo ? "" : "select_account" });
  });
}

export function revocar(token) {
  try { globalThis.google?.accounts?.oauth2?.revoke(token, () => {}); } catch { /* sin conexión: el permiso se puede retirar en myaccount.google.com */ }
}

export class TokenCaducado extends Error {}

async function llamar(token, ruta, params = {}, { metodo = "GET", cuerpo } = {}) {
  const url = new URL(API + ruta);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) url.searchParams.set(k, v);
  const r = await fetch(url, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, ...(cuerpo ? { "Content-Type": "application/json" } : {}) },
    ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
  });
  if (r.status === 401) throw new TokenCaducado("El permiso ha caducado: pulsa «Actualizar».");
  if (r.status === 403 && metodo !== "GET") throw new Error("Google no deja escribir en ese calendario con este permiso. Solo se puede en calendarios tuyos.");
  if (!r.ok) throw new Error(`Google Calendar respondió ${r.status}.`);
  return r.json();
}

// ---------- crear eventos (D-050) ----------
const dos = (n) => String(n).padStart(2, "0");
const horaLocal = (dia, min) => `${sumarDias(dia, Math.floor(min / 1440))}T${dos(Math.floor((min % 1440) / 60))}:${dos(min % 60)}:00`;

/**
 * El cuerpo de events.insert. Con hora: fecha y hora locales más la zona (Google no exige el desfase si hay
 * `timeZone`); un fin de más de 24 h pasa al día siguiente. Todo el día: la fecha de fin es exclusiva.
 */
export function cuerpoEvento({ titulo, dia, inicio, fin, todoElDia }, zona) {
  const base = { summary: titulo, description: "Creado desde Pauta." };
  if (todoElDia) return { ...base, start: { date: dia }, end: { date: sumarDias(dia, 1) } };
  return { ...base, start: { dateTime: horaLocal(dia, inicio), timeZone: zona }, end: { dateTime: horaLocal(dia, fin), timeZone: zona } };
}

/** Compara lo pedido con lo que Google devuelve al releer. Devuelve las diferencias (vacío = todo cuadra). */
export function comprobarEvento(pedido, leido) {
  const dif = [];
  if (!leido || leido.status === "cancelled") return ["El evento no aparece en Google."];
  if ((leido.summary ?? "") !== pedido.summary) dif.push(`El título en Google es «${leido.summary ?? ""}».`);
  const instante = (x) => (x?.date ? x.date : x?.dateTime ? new Date(x.dateTime).getTime() : null);
  const esperado = (x) => (x.date ? x.date : new Date(x.dateTime).getTime()); // la hora local de este dispositivo
  if (instante(leido.start) !== esperado(pedido.start)) dif.push("La hora de inicio en Google no es la pedida.");
  if (instante(leido.end) !== esperado(pedido.end)) dif.push("La hora de fin en Google no es la pedida.");
  return dif;
}

export const crearEvento = (token, calendarioId, cuerpo) => llamar(token, `/calendars/${encodeURIComponent(calendarioId)}/events`, {}, { metodo: "POST", cuerpo });
export const leerEvento = (token, calendarioId, id) => llamar(token, `/calendars/${encodeURIComponent(calendarioId)}/events/${encodeURIComponent(id)}`);

/** Calendarios donde se puede crear con `calendar.events.owned`: los tuyos. El principal primero. */
export const calendariosPropios = (cuenta) => (cuenta.calendarios ?? []).filter((c) => c.rol === "owner" || c.principal).sort((a, b) => !!b.principal - !!a.principal);

/** Tus calendarios. El principal tiene como id la dirección de la cuenta. Se encienden los que ya ves en Google (`selected`, que si falta vale false). */
export async function listarCalendarios(token) {
  const items = [];
  let pageToken;
  do {
    const j = await llamar(token, "/users/me/calendarList", { maxResults: 250, pageToken });
    items.push(...j.items);
    pageToken = j.nextPageToken;
  } while (pageToken);
  return items.map((c) => ({ id: c.id, nombre: c.summaryOverride ?? c.summary, principal: !!c.primary, activo: c.selected === true || !!c.primary, rol: c.accessRole }));
}

export async function listarEventos(token, calendarioId, desde, hasta) {
  const items = [];
  let pageToken;
  do {
    const j = await llamar(token, `/calendars/${encodeURIComponent(calendarioId)}/events`, {
      timeMin: new Date(desde + "T00:00:00").toISOString(), timeMax: new Date(hasta + "T23:59:59").toISOString(),
      singleEvents: "true", orderBy: "startTime", maxResults: 2500, pageToken,
    });
    items.push(...j.items);
    pageToken = j.nextPageToken;
  } while (pageToken);
  return items;
}

const minutos = (d) => d.getHours() * 60 + d.getMinutes();

/** Convierte un evento de Google en los de Pauta (uno por día si dura varios días). */
export function convertirEvento(ev, calendario, cuentaId) {
  if (ev.status === "cancelled") return [];
  if (ev.attendees?.some((a) => a.self && a.responseStatus === "declined")) return [];
  const base = { cuenta: cuentaId, calendarioId: calendario.id, gid: ev.id, uid: ev.iCalUID ?? ev.id, titulo: ev.summary?.trim() || "(sin título)", lugar: ev.location ?? "", calendario: calendario.nombre, enlace: ev.htmlLink ?? "", ejemplo: false, opcional: false, todoElDia: false };
  const out = [];
  if (ev.start?.date) {
    // Todo el día: la fecha de fin es exclusiva
    for (let d = ev.start.date; d < ev.end.date; ) {
      out.push({ ...base, id: `${cuentaId}|${calendario.id}|${ev.id}|${d}`, dia: d, inicio: 0, fin: 0, todoElDia: true });
      const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + 1); d = aISO(x);
    }
    return out;
  }
  const ini = new Date(ev.start.dateTime), fin = new Date(ev.end.dateTime);
  for (let d = aISO(ini); d <= aISO(fin); ) {
    const desde = d === aISO(ini) ? minutos(ini) : 0;
    const hasta = d === aISO(fin) ? minutos(fin) : 24 * 60;
    if (hasta > desde) out.push({ ...base, id: `${cuentaId}|${calendario.id}|${ev.id}|${d}`, dia: d, inicio: desde, fin: hasta });
    const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + 1); d = aISO(x);
  }
  return out;
}

/** Siguiente color libre (cuenta-1 … cuenta-4; desde la quinta se repiten). */
export function colorLibre(usados) {
  const todos = ["c1", "c2", "c3", "c4"];
  return todos.find((c) => !usados.includes(c)) ?? todos[usados.length % 4];
}
