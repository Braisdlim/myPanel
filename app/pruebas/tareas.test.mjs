import { test } from "node:test";
import assert from "node:assert/strict";
import { crearTarea, filtrar, deHoy, completar, contar, porDia } from "../src/lib/tareas.js";

const HOY = "2026-10-23";
const ts = [
  crearTarea({ titulo: "Renovar el DNI" }),
  crearTarea({ titulo: "Pedir cita", cuando: HOY, inicio: 11 * 60 + 50, duracionMin: 15 }),
  crearTarea({ titulo: "Pagar la tasa", limite: HOY }),
  crearTarea({ titulo: "Atrasada", cuando: "2026-10-20" }),
  crearTarea({ titulo: "Llamar a la gestoría", cuando: "2026-10-26" }),
  crearTarea({ titulo: "Aprender a tocar el piano", lista: "algun" }),
  crearTarea({ titulo: "Ordenar fotos", lista: "cualquier" }),
  completar(crearTarea({ titulo: "Comprar pilas" }), true),
];

test("Hoy incluye lo de hoy, lo atrasado y lo que vence hoy", () => {
  assert.deepEqual(deHoy(ts, HOY).map((t) => t.titulo).sort(), ["Atrasada", "Pagar la tasa", "Pedir cita"]);
});

test("cada lista tiene lo suyo", () => {
  const n = (l) => filtrar(ts, l, HOY).map((t) => t.titulo);
  assert.deepEqual(n("entrada"), ["Renovar el DNI", "Pagar la tasa"]);
  assert.deepEqual(n("programadas"), ["Llamar a la gestoría"]);
  assert.deepEqual(n("algun"), ["Aprender a tocar el piano"]);
  assert.deepEqual(n("cualquier"), ["Ordenar fotos"]);
  assert.deepEqual(n("registro"), ["Comprar pilas"]);
});

test("completar y descompletar", () => {
  const t = completar(ts[0]);
  assert.equal(t.hecha, true);
  assert.ok(t.hechaEn);
  assert.equal(completar(t).hechaEn, null);
});

test("conteos y agrupación por día", () => {
  assert.equal(contar(ts, HOY).hoy, 3);
  assert.deepEqual(porDia(filtrar(ts, "programadas", HOY)).map(([d]) => d), ["2026-10-26"]);
});
