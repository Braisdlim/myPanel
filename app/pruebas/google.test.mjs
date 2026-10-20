// Conversión de eventos de Google Calendar y unión de cuentas. Los eventos imitan el formato de la API v3 (events.list).
process.env.TZ = "Europe/Madrid";
import { test } from "node:test";
import assert from "node:assert/strict";
import { convertirEvento, colorLibre } from "../src/lib/google.js";
import { indexar } from "../src/lib/calendario.js";
import { haceCuanto } from "../src/lib/fechas.js";

const CAL = { id: "yo@gmail.com", nombre: "yo@gmail.com", activo: true };
const H = (h, m = 0) => h * 60 + m;

test("evento con hora: día, inicio, fin y enlace", () => {
  const [e, ...resto] = convertirEvento({ id: "a1", iCalUID: "a1@google.com", status: "confirmed", summary: " Dentista ", location: "Clínica", htmlLink: "https://www.google.com/calendar/event?eid=x",
    start: { dateTime: "2026-10-23T17:00:00+02:00" }, end: { dateTime: "2026-10-23T17:45:00+02:00" } }, CAL, "yo@gmail.com");
  assert.equal(resto.length, 0);
  assert.deepEqual([e.dia, e.inicio, e.fin, e.titulo, e.lugar, e.todoElDia, e.uid], ["2026-10-23", H(17), H(17, 45), "Dentista", "Clínica", false, "a1@google.com"]);
  assert.equal(e.enlace, "https://www.google.com/calendar/event?eid=x");
  assert.equal(e.ejemplo, false);
});

test("la hora se pasa a la zona del dispositivo", () => {
  const [e] = convertirEvento({ id: "a2", start: { dateTime: "2026-10-23T15:00:00Z" }, end: { dateTime: "2026-10-23T16:00:00Z" } }, CAL, "c");
  assert.deepEqual([e.inicio, e.fin], [H(17), H(18)]);
});

test("un evento que cruza la medianoche se parte en dos días", () => {
  const evs = convertirEvento({ id: "a3", summary: "Ensayo largo", start: { dateTime: "2026-10-23T22:30:00+02:00" }, end: { dateTime: "2026-10-24T01:00:00+02:00" } }, CAL, "c");
  assert.deepEqual(evs.map((e) => [e.dia, e.inicio, e.fin]), [["2026-10-23", H(22, 30), H(24)], ["2026-10-24", 0, H(1)]]);
  assert.notEqual(evs[0].id, evs[1].id);
});

test("todo el día: la fecha de fin es exclusiva", () => {
  const uno = convertirEvento({ id: "b1", summary: "Vence el seguro", start: { date: "2026-11-01" }, end: { date: "2026-11-02" } }, CAL, "c");
  assert.deepEqual(uno.map((e) => [e.dia, e.todoElDia]), [["2026-11-01", true]]);
  const tres = convertirEvento({ id: "b2", summary: "Vacaciones", start: { date: "2026-12-30" }, end: { date: "2027-01-02" } }, CAL, "c");
  assert.deepEqual(tres.map((e) => e.dia), ["2026-12-30", "2026-12-31", "2027-01-01"]);
});

test("el cambio de hora de octubre no duplica ni salta días", () => {
  const evs = convertirEvento({ id: "b3", start: { date: "2026-10-24" }, end: { date: "2026-10-27" } }, CAL, "c");
  assert.deepEqual(evs.map((e) => e.dia), ["2026-10-24", "2026-10-25", "2026-10-26"]);
});

test("se omiten los cancelados y los que has rechazado; sin título se dice", () => {
  const base = { start: { dateTime: "2026-10-23T10:00:00+02:00" }, end: { dateTime: "2026-10-23T11:00:00+02:00" } };
  assert.deepEqual(convertirEvento({ ...base, id: "c1", status: "cancelled" }, CAL, "c"), []);
  assert.deepEqual(convertirEvento({ ...base, id: "c2", attendees: [{ email: "yo@gmail.com", self: true, responseStatus: "declined" }] }, CAL, "c"), []);
  assert.equal(convertirEvento({ ...base, id: "c3", attendees: [{ self: true, responseStatus: "accepted" }] }, CAL, "c").length, 1);
  assert.equal(convertirEvento({ ...base, id: "c4" }, CAL, "c")[0].titulo, "(sin título)");
});

test("colores de cuenta por orden de conexión", () => {
  assert.equal(colorLibre([]), "c1");
  assert.equal(colorLibre(["c1"]), "c2");
  assert.equal(colorLibre(["c2"]), "c1");
  assert.equal(colorLibre(["c1", "c2", "c3", "c4"]), "c1");
});

test("unir cuentas: el mismo evento en dos cuentas se muestra una vez", () => {
  const ev = (cuenta, cal, id, uid, h) => convertirEvento({ id, iCalUID: uid, summary: id, start: { dateTime: `2026-10-23T${h}:00:00+02:00` }, end: { dateTime: `2026-10-23T${h}:30:00+02:00` } }, cal, cuenta)[0];
  const calA = { id: "a@gmail.com", nombre: "a@gmail.com", activo: true }, calB = { id: "b@gmail.com", nombre: "b@gmail.com", activo: true };
  const festivos = { id: "es.spain#holiday", nombre: "Festivos", activo: false };
  const cuentas = [{ id: "a@gmail.com", calendarios: [calA] }, { id: "b@gmail.com", calendarios: [calB, festivos] }];
  const indice = indexar({
    "a@gmail.com": [ev("a@gmail.com", calA, "cena", "cena@x", "21"), ev("a@gmail.com", calA, "gym", "gym@x", "19")],
    "b@gmail.com": [ev("b@gmail.com", calB, "cena-b", "cena@x", "21"), ev("b@gmail.com", festivos, "fiesta", "fiesta@x", "10")],
  }, cuentas);
  const dia = indice.get("2026-10-23");
  assert.deepEqual(dia.map((e) => e.titulo), ["gym", "cena"]); // ordenados, sin el festivo apagado ni la copia
  assert.deepEqual(dia[1].tambien, ["b@gmail.com"]);
  assert.equal(dia[1].cuenta, "a@gmail.com");
});

test("hace cuánto se actualizó", () => {
  const ahora = new Date("2026-10-20T18:00:00+02:00");
  assert.equal(haceCuanto("2026-10-20T17:59:40+02:00", ahora), "hace un momento");
  assert.equal(haceCuanto("2026-10-20T17:35:00+02:00", ahora), "hace 25 min");
  assert.equal(haceCuanto("2026-10-20T15:00:00+02:00", ahora), "hace 3 h");
  assert.equal(haceCuanto("2026-10-19T09:05:00+02:00", ahora), "ayer a las 9:05");
  assert.equal(haceCuanto("2026-10-12T09:05:00+02:00", ahora), "el lun 12 oct a las 9:05");
});
