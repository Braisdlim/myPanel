// Google Calendar en solo lectura, desde el navegador y sin servidor (research/google-calendar/notas.md).
// La biblioteca de Google da un token de acceso de corta duración; Pauta no guarda tokens en disco.
import { aISO } from "./fechas.js";

// ID de cliente del proyecto «proyecto-pauta» de Google Cloud. Es público por diseño (va en la página y no hay
// secreto); el usuario pidió subirlo al repositorio el 20-10-2026 (D-040). PUBLIC_GOOGLE_CLIENT_ID en app/.env lo sustituye.
const ID_DEL_PROYECTO = "1035846726614-g3k1ctssie46vend4ihglf5ujbgef7fr.apps.googleusercontent.com";
export const CLIENT_ID = import.meta.env?.PUBLIC_GOOGLE_CLIENT_ID || ID_DEL_PROYECTO;
export const PERMISOS = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly", // la lista de tus calendarios
  "https://www.googleapis.com/auth/calendar.events.readonly", // ver los eventos, sin poder cambiarlos
];
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

/** Pide un token. Con `correo`, salta la elección de cuenta; sin él, deja elegir otra cuenta. Debe llamarse desde un clic. */
export async function pedirToken({ correo = null } = {}) {
  if (!CLIENT_ID) throw new Error("Falta el ID de cliente de Google (PUBLIC_GOOGLE_CLIENT_ID en app/.env).");
  await cargarBiblioteca();
  const oauth = globalThis.google.accounts.oauth2;
  return new Promise((ok, mal) => {
    const cliente = oauth.initTokenClient({
      client_id: CLIENT_ID,
      scope: PERMISOS.join(" "),
      ...(correo ? { login_hint: correo } : {}),
      callback: (r) => {
        if (r.error) return mal(new Error(r.error === "access_denied" ? "Has cancelado el permiso." : `Google respondió: ${r.error}`));
        if (!oauth.hasGrantedAllScopes(r, ...PERMISOS)) return mal(new Error("Hace falta marcar los dos permisos de calendario para conectar."));
        ok({ token: r.access_token, caduca: Date.now() + (Number(r.expires_in) - 60) * 1000 });
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

async function llamar(token, ruta, params = {}) {
  const url = new URL(API + ruta);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 401) throw new TokenCaducado("El permiso ha caducado: pulsa «Actualizar».");
  if (!r.ok) throw new Error(`Google Calendar respondió ${r.status}.`);
  return r.json();
}

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
  const base = { cuenta: cuentaId, calendarioId: calendario.id, uid: ev.iCalUID ?? ev.id, titulo: ev.summary?.trim() || "(sin título)", lugar: ev.location ?? "", calendario: calendario.nombre, enlace: ev.htmlLink ?? "", ejemplo: false, opcional: false, todoElDia: false };
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
