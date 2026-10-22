// Horario de trabajo (D-054), con los títulos reales del calendario del usuario (20-10-2026).
process.env.TZ = "Europe/Madrid";
import { test } from "node:test";
import assert from "node:assert/strict";
import { HORARIO_INICIAL, marcaLibre, listaPalabras, bloqueTrabajo, motivoLibre, proximosLibres } from "../src/lib/horario.js";
import { sumarDias } from "../src/lib/fechas.js";
import { conflictos } from "../src/lib/ejemplo.js";

const CFG = { ...HORARIO_INICIAL, activo: true };
const P = listaPalabras(CFG.palabras);
const propio = (id) => id === "yo@gmail.com";
const todoDia = (dia, titulo, calendarioId = "yo@gmail.com") => ({ id: `${calendarioId}|${dia}|${titulo}`, dia, titulo, todoElDia: true, inicio: 0, fin: 0, calendarioId, cuenta: "yo@gmail.com" });

test("palabras que marcan un día libre: sin tildes ni mayúsculas y como palabra completa", () => {
  assert.ok(marcaLibre("Vacaciones", P));
  assert.ok(marcaLibre("Festivo (No trabajo)", P));
  assert.ok(marcaLibre("Día libre", P));
  assert.ok(marcaLibre("DIA LIBRE por mudanza", P));
  assert.ok(!marcaLibre("¡Feliz cumpleaños!", P));
  assert.ok(!marcaLibre("Festivos y más", P)); // «festivos» no es «festivo»
  assert.ok(!marcaLibre("Trabajo en casa", P)); // «trabajo» solo no basta: hace falta «no trabajo»
});

test("bloque de trabajo de lunes a viernes de 8:00 a 17:30", () => {
  const lunes = "2026-10-26", sabado = "2026-10-24";
  const b = bloqueTrabajo(lunes, CFG, [], propio);
  assert.deepEqual([b.titulo, b.inicio, b.fin, b.trabajo], ["Trabajo", 480, 1050, true]);
  assert.equal(bloqueTrabajo(sabado, CFG, [], propio), null);
  assert.equal(bloqueTrabajo(lunes, { ...CFG, activo: false }, [], propio), null);
});

test("no hay trabajo los días que marcas libres en tus calendarios", () => {
  assert.equal(bloqueTrabajo("2026-12-08", CFG, [todoDia("2026-12-08", "Festivo (No trabajo)")], propio), null); // martes
  assert.equal(bloqueTrabajo("2026-09-07", CFG, [todoDia("2026-09-07", "Vacaciones")], propio), null);
  assert.ok(bloqueTrabajo("2026-11-18", CFG, [todoDia("2026-11-18", "¡Feliz cumpleaños!")], propio)); // cumpleaños: se trabaja
});

test("los festivos de Google y los calendarios compartidos no cuentan (mezclan días que no son fiesta)", () => {
  const google = todoDia("2027-02-09", "Martes de Carnaval", "es.spain#holiday@group.v.calendar.google.com");
  assert.ok(bloqueTrabajo("2027-02-09", CFG, [google], propio));
  const uni = todoDia("2026-11-02", "Festivo", "esei.uvigo.es_x@group.calendar.google.com");
  assert.ok(bloqueTrabajo("2026-11-02", CFG, [uni], propio));
  // …salvo que una copia unida del mismo evento esté en un calendario tuyo
  assert.equal(motivoLibre([{ ...uni, fuentes: [{ calendarioId: "yo@gmail.com" }] }], CFG, propio)?.titulo, "Festivo");
});

test("próximos días libres: solo los laborables, con su motivo", () => {
  const eventos = { "2026-12-08": [todoDia("2026-12-08", "Festivo (No trabajo)")], "2026-12-06": [todoDia("2026-12-06", "Festivo (No trabajo)")] }; // el 6 es domingo
  const r = proximosLibres("2026-12-01", "2026-12-10", CFG, (d) => eventos[d] ?? [], propio, sumarDias);
  assert.deepEqual(r.map((x) => [x.dia, x.motivo]), [["2026-12-08", "Festivo (No trabajo)"]]);
});

test("el trabajo no cuenta como solape con tus planes", () => {
  const trabajo = bloqueTrabajo("2026-10-26", CFG, [], propio);
  const reunion = { id: "r", dia: "2026-10-26", inicio: 600, fin: 660, cuenta: "yo@gmail.com", todoElDia: false };
  assert.deepEqual(conflictos([trabajo, reunion]), []);
});
