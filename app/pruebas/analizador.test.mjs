// Pruebas del analizador de «Apuntar». Hoy es el viernes 23 de octubre de 2026 (los mismos casos que el banco del asistente).
import { test } from "node:test";
import assert from "node:assert/strict";
import { analizar, resolver } from "../src/lib/analizador.js";

const HOY = "2026-10-23";
const a = (t) => analizar(t, HOY);
const hm = (min) => (min === null ? null : `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`);
const tiposDuda = (r) => r.dudas.map((d) => d.tipo).sort();

test("«el viernes» siendo viernes y «de 9 a 11»: pregunta día y hora", () => {
  const r = a("El viernes ceno con mis amigos de 9 a 11");
  assert.deepEqual(tiposDuda(r), ["dia", "hora"]);
  assert.equal(r.titulo, "Ceno con mis amigos");
  const dia = r.dudas.find((d) => d.tipo === "dia");
  assert.deepEqual(dia.opciones.map((o) => o.fecha), ["2026-10-23", "2026-10-30"]);
  const hora = r.dudas.find((d) => d.tipo === "hora");
  assert.deepEqual(hora.opciones.map((o) => [hm(o.inicio), hm(o.fin)]), [["9:00", "11:00"], ["21:00", "23:00"]]);
  const r2 = resolver(resolver(r, r.dudas.indexOf(dia), dia.opciones[1]), 0, hora.opciones[1]);
  assert.equal(r2.fecha, "2026-10-30");
  assert.equal(hm(r2.inicio), "21:00");
  assert.equal(r2.dudas.length, 0);
});

test("«mañana a las cinco y media»: mañana y pregunta la hora", () => {
  const r = a("Mañana dentista a las cinco y media");
  assert.equal(r.fecha, "2026-10-24");
  assert.deepEqual(tiposDuda(r), ["hora"]);
  assert.deepEqual(r.dudas[0].opciones.map((o) => hm(o.inicio)), ["5:30", "17:30"]);
  assert.equal(r.titulo, "Dentista");
});

test("«el martes de 10 a 11»: martes 27 y pregunta mañana o noche", () => {
  const r = a("Pon una reunión con Laura el martes de 10 a 11");
  assert.equal(r.fecha, "2026-10-27");
  assert.equal(r.titulo, "Una reunión con Laura");
  assert.deepEqual(tiposDuda(r), ["hora"]);
});

test("«el lunes 2 de noviembre a las 9:15»: fecha con mes que cuadra", () => {
  const r = a("el lunes 2 de noviembre tengo médico a las 9:15");
  assert.equal(r.fecha, "2026-11-02");
  assert.equal(hm(r.inicio), "9:15");
  assert.deepEqual(tiposDuda(r), ["hora"]);
});

test("«el 14 de diciembre, todo el día»", () => {
  const r = a("Apúntame el cumpleaños de mi madre el 14 de diciembre, todo el día");
  assert.equal(r.fecha, "2026-12-14");
  assert.equal(r.todoElDia, true);
  assert.equal(r.titulo, "Cumpleaños de mi madre");
  assert.equal(r.tipo, "evento");
});

test("«pasado mañana de 19 a 20:30»", () => {
  const r = a("pádel pasado mañana de 19 a 20:30");
  assert.equal(r.fecha, "2026-10-25");
  assert.equal(hm(r.inicio), "19:00");
  assert.equal(hm(r.fin), "20:30");
  assert.equal(r.dudas.length, 0);
  assert.equal(r.titulo, "Pádel");
});

test("«la semana que viene el jueves … a las dos»", () => {
  const r = a("la semana que viene el jueves comida con el equipo a las dos");
  assert.equal(r.fecha, "2026-10-29");
  assert.deepEqual(tiposDuda(r), ["hora"]);
  assert.equal(r.titulo, "Comida con el equipo");
});

test("«dentro de dos semanas … a las 8 de la mañana»", () => {
  const r = a("dentro de dos semanas revisión del coche a las 8 de la mañana");
  assert.equal(r.fecha, "2026-11-06");
  assert.equal(hm(r.inicio), "8:00");
  assert.equal(r.dudas.length, 0);
  assert.equal(r.titulo, "Revisión del coche");
});

test("«hoy a las 18 …, media hora»", () => {
  const r = a("hoy a las 18 llamada con el banco, media hora");
  assert.equal(r.fecha, "2026-10-23");
  assert.equal(hm(r.inicio), "18:00");
  assert.equal(hm(r.fin), "18:30");
  assert.equal(r.titulo, "Llamada con el banco");
});

test("«el miércoles 28 a las 21» cuadra; «el jueves 28» no", () => {
  const r = a("cena el miércoles 28 a las 21");
  assert.equal(r.fecha, "2026-10-28");
  assert.equal(hm(r.inicio), "21:00");
  assert.equal(r.dudas.length, 0);
  const r2 = a("cena el jueves 28 a las 21");
  assert.deepEqual(tiposDuda(r2), ["dia"]);
  assert.match(r2.dudas[0].texto, /miércoles/);
});

test("«el 31 de febrero» no existe", () => {
  const r = a("el 31 de febrero cena con los de la uni");
  assert.equal(r.fecha, null);
  assert.deepEqual(tiposDuda(r), ["fecha"]);
});

test("tareas: «recuérdame … el lunes», «tengo que renovar el DNI»", () => {
  const r = a("Recuérdame llamar a la gestoría el lunes");
  assert.equal(r.tipo, "tarea");
  assert.equal(r.fecha, "2026-10-26");
  assert.equal(r.titulo, "Llamar a la gestoría");
  const r2 = a("tengo que renovar el DNI");
  assert.equal(r2.tipo, "tarea");
  assert.equal(r2.fecha, null);
  assert.equal(r2.titulo, "Renovar el DNI");
});

test("«por la tarde» resuelve la hora; «este viernes» es hoy", () => {
  const r = a("este viernes a las 6 por la tarde café con Ana");
  assert.equal(r.fecha, "2026-10-23");
  assert.equal(hm(r.inicio), "18:00");
  assert.equal(r.dudas.length, 0);
});

test("«el lunes que viene» es el próximo lunes", () => {
  assert.equal(a("ITV el lunes que viene").fecha, "2026-10-26");
  assert.equal(a("ITV el próximo viernes").fecha, "2026-10-30");
});

test("las marcas no se solapan y señalan texto real", () => {
  const t = "Mañana dentista a las cinco y media";
  const r = a(t);
  assert.deepEqual(r.marcas.map(([x, y]) => t.slice(x, y)), ["Mañana", "a las cinco y media"]);
});
