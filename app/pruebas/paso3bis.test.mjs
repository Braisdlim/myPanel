// Paso 3 bis: cambiar solo esta vez (D-052). Huecos para «Mover esta vez», «No voy esta vez» y el cuerpo de los cambios.
process.env.TZ = "Europe/Madrid";
import { test } from "node:test";
import assert from "node:assert/strict";
import { convertirEvento, cuerpoMover, comprobarEvento } from "../src/lib/google.js";
import { proponerHuecos, pisaria, bloquea, claveOcurrencia, clavesDe, indexar } from "../src/lib/calendario.js";
import { conflictos } from "../src/lib/ejemplo.js";

const H = (h, m = 0) => h * 60 + m;
const ev = (id, dia, ini, fin, extra = {}) => ({ id, uid: `${id}@x`, dia, inicio: ini, fin, todoElDia: false, cuenta: "yo", titulo: id, ...extra });

test("Google: la ocurrencia de una serie guarda la serie a la que pertenece", () => {
  const cal = { id: "yo@gmail.com", nombre: "yo@gmail.com" };
  const [e] = convertirEvento({ id: "abc_20261030T203000Z", recurringEventId: "abc", iCalUID: "abc@google.com", summary: "Pádel",
    originalStartTime: { dateTime: "2026-10-30T21:30:00+01:00" }, start: { dateTime: "2026-10-30T21:30:00+01:00" }, end: { dateTime: "2026-10-30T23:00:00+01:00" } }, cal, "yo");
  assert.deepEqual([e.gid, e.serie], ["abc_20261030T203000Z", "abc"]);
  const [suelto] = convertirEvento({ id: "x", summary: "Dentista", start: { dateTime: "2026-10-27T10:30:00+01:00" }, end: { dateTime: "2026-10-27T11:30:00+01:00" } }, cal, "yo");
  assert.equal(suelto.serie, null);
});

test("huecos para mover: misma hora en días cercanos primero, sin pisar nada ni ir al pasado", () => {
  const padel = ev("padel", "2026-10-30", H(21, 30), H(23)); // viernes
  const dias = {
    "2026-10-30": [padel],
    "2026-10-31": [ev("cena", "2026-10-31", H(21), H(23))], // sábado ocupado a esa hora
    "2026-10-29": [ev("opcional", "2026-10-29", H(21), H(22), { opcional: true })], // no bloquea
  };
  const de = (d) => dias[d] ?? [];
  const h = proponerHuecos(padel, de, "2026-10-22", H(12));
  assert.equal(h.length, 3);
  assert.ok(h.every((x) => x.fin - x.inicio === 90 && x.inicio === H(21, 30)));
  assert.deepEqual(h.map((x) => x.dia), ["2026-10-28", "2026-10-29", "2026-11-01"]); // ni el sábado (cena) ni el viernes original
  // Hoy a las 22:00 ya no se ofrece una hora pasada de hoy
  const hoy = ev("hoy", "2026-10-22", H(21, 30), H(23));
  assert.ok(proponerHuecos(hoy, () => [], "2026-10-22", H(22)).every((x) => x.dia > "2026-10-22" || x.inicio > H(22)));
});

test("sin huecos a la misma hora, propone otras horas del mismo día", () => {
  const e = ev("e", "2026-11-02", H(10), H(11));
  const lleno = (d) => (d === "2026-11-02" ? [e, ev("x", d, H(11), H(12))] : [ev("y" + d, d, H(9), H(12))]);
  const h = proponerHuecos(e, lleno, "2026-10-22", 0);
  assert.deepEqual(h.map((x) => [x.dia, x.inicio]), [["2026-11-02", H(8, 30)], ["2026-11-02", H(9)], ["2026-11-02", H(9, 30)]]);
});

test("«Otra hora…» avisa de lo que pisaría", () => {
  const e = ev("e", "2026-10-30", H(21, 30), H(23));
  const de = () => [e, ev("cine", "2026-10-30", H(20), H(22))];
  assert.deepEqual(pisaria(e, "2026-10-30", H(21), H(22, 30), de).map((x) => x.titulo), ["cine"]);
  assert.deepEqual(pisaria(e, "2026-10-30", H(22), H(23), de), []);
});

test("«No voy esta vez»: por ocurrencia; vale para cualquiera de las copias unidas", () => {
  const a = ev("ensayo", "2026-10-30", H(21, 30), H(23, 30));
  assert.equal(claveOcurrencia(a), "ensayo@x|2026-10-30|1290");
  assert.notEqual(claveOcurrencia(a), claveOcurrencia({ ...a, dia: "2026-11-06" })); // otro viernes, otra clave
  const unido = { ...a, fuentes: [{ uid: "copia@x" }, { uid: "otra@x" }] };
  assert.deepEqual(clavesDe(unido), ["ensayo@x|2026-10-30|1290", "copia@x|2026-10-30|1290", "otra@x|2026-10-30|1290"]);
});

test("lo que marcas «No voy esta vez» no bloquea ni cuenta como solape", () => {
  const a = { ...ev("ensayo", "2026-10-30", H(21, 30), H(23, 30)), cuenta: "c1" }, b = { ...ev("cena", "2026-10-30", H(21), H(23)), cuenta: "c2" };
  assert.equal(conflictos([a, b]).length, 1);
  assert.equal(conflictos([{ ...a, noVoy: true }, b]).length, 0);
  assert.ok(bloquea(a) && !bloquea({ ...a, noVoy: true }) && !bloquea({ ...a, todoElDia: true }));
});

test("mover: solo cambian las horas, con zona; la relectura no mira el título", () => {
  const c = cuerpoMover({ dia: "2026-10-31", inicio: H(19), fin: H(20, 30) }, "Europe/Madrid");
  assert.deepEqual(c, { start: { dateTime: "2026-10-31T19:00:00", timeZone: "Europe/Madrid" }, end: { dateTime: "2026-10-31T20:30:00", timeZone: "Europe/Madrid" } });
  assert.deepEqual(comprobarEvento(c, { summary: "Pádel", start: { dateTime: "2026-10-31T19:00:00+01:00" }, end: { dateTime: "2026-10-31T19:30:00Z" } }), []);
  assert.equal(comprobarEvento(c, { summary: "Pádel", start: { dateTime: "2026-10-30T21:30:00+01:00" }, end: { dateTime: "2026-10-31T19:30:00Z" } }).length, 1);
});

test("el ensayo unido en tres calendarios sigue unido al marcar una copia", () => {
  const cal = (id) => ({ id, nombre: id, rol: "reader", activo: true });
  const cuentas = [{ id: "yo", calendarios: [cal("g1"), cal("g2")] }];
  const e = (c, id) => convertirEvento({ id, iCalUID: `${id}@g`, summary: "Ensayo General", start: { dateTime: "2026-10-30T21:30:00+01:00" }, end: { dateTime: "2026-10-30T23:30:00+01:00" } }, cal(c), "yo");
  const [unido] = indexar({ yo: [...e("g1", "a"), ...e("g2", "b")] }, cuentas).get("2026-10-30");
  assert.deepEqual(clavesDe(unido), ["a@g|2026-10-30|1290", "b@g|2026-10-30|1290"]);
});
