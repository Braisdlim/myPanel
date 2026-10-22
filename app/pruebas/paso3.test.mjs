// Paso 3: eventos repetidos entre calendarios (P-043) y crear eventos (D-050). Formato de la API v3 de Calendar.
process.env.TZ = "Europe/Madrid";
import { test } from "node:test";
import assert from "node:assert/strict";
import { convertirEvento, cuerpoEvento, comprobarEvento, calendariosPropios } from "../src/lib/google.js";
import { indexar, mismoTitulo, finesDistintos } from "../src/lib/calendario.js";

const H = (h, m = 0) => h * 60 + m;
const YO = "yo@gmail.com";
const cal = (id, nombre, rol, extra = {}) => ({ id, nombre, rol, activo: true, ...extra });
const ev = (c, id, titulo, ini, fin, extra = {}) =>
  convertirEvento({ id, iCalUID: `${id}@google.com`, summary: titulo, start: { dateTime: ini }, end: { dateTime: fin }, ...extra }, c, YO);

test("títulos equivalentes: el corto está dentro del largo, sin tildes ni signos", () => {
  assert.ok(mismoTitulo("Ensayo General", "Ensayo General | Banda de Música de Noia"));
  assert.ok(mismoTitulo("ENSAYO general", "ensayo-general"));
  assert.ok(mismoTitulo("Cena", "Cena con Ana"));
  assert.ok(!mismoTitulo("Dentista", "Ensayo General"));
  assert.ok(!mismoTitulo("Reunión de equipo", "Reunión con la gestoría"));
  assert.ok(mismoTitulo("", "  "));
  assert.ok(!mismoTitulo("", "Cena"));
});

test("el ensayo real copiado en tres calendarios compartidos se ve una vez (P-043)", () => {
  const g1 = cal("glis1@group", "Glissandoo", "reader"), g2 = cal("glis2@group", "Glissandoo", "reader"), banda = cal("bandadenoia@gmail.com", "bandadenoia@gmail.com", "reader");
  const principal = cal(YO, YO, "owner", { principal: true });
  const cuentas = [{ id: YO, calendarios: [principal, g1, g2, banda] }];
  const evs = [
    ...ev(g1, "a", "Ensayo General | Banda de Música de Noia", "2026-10-23T21:30:00+02:00", "2026-10-23T23:30:00+02:00"),
    ...ev(g2, "b", "Ensayo General | Banda de Música de Noia", "2026-10-23T21:30:00+02:00", "2026-10-23T23:30:00+02:00"),
    ...ev(banda, "c", "Ensayo General", "2026-10-23T21:30:00+02:00", "2026-10-24T00:00:00+02:00"),
    ...ev(principal, "d", "Cena", "2026-10-23T21:30:00+02:00", "2026-10-23T23:00:00+02:00"), // otro plan a la misma hora: no se une
  ];
  const dia = indexar({ [YO]: evs }, cuentas).get("2026-10-23");
  assert.deepEqual(dia.map((e) => e.titulo).sort(), ["Cena", "Ensayo General | Banda de Música de Noia"]);
  const ensayo = dia.find((e) => e.titulo.startsWith("Ensayo"));
  assert.equal(ensayo.unidoPor, "parecido");
  assert.equal(ensayo.fuentes.length, 2);
  assert.deepEqual(finesDistintos(ensayo), [H(24)]); // «otro calendario dice hasta las 0:00»
  assert.deepEqual(ensayo.tambien, []); // todo en la misma cuenta
});

test("se muestra la copia con la hora de fin en la que coinciden más calendarios, aunque llegue después", () => {
  const banda = cal("banda", "bandadenoia@gmail.com", "reader"), g1 = cal("g1", "Glissandoo", "reader"), g2 = cal("g2", "Glissandoo", "reader");
  const evs = [
    ...ev(banda, "c", "Ensayo General", "2026-10-23T21:30:00+02:00", "2026-10-24T00:00:00+02:00"), // llega primero (como en la prueba real)
    ...ev(g1, "a", "Ensayo General | Banda de Música de Noia", "2026-10-23T21:30:00+02:00", "2026-10-23T23:30:00+02:00"),
    ...ev(g2, "b", "Ensayo General | Banda de Música de Noia", "2026-10-23T21:30:00+02:00", "2026-10-23T23:30:00+02:00"),
  ];
  const [e] = indexar({ [YO]: evs }, [{ id: YO, calendarios: [banda, g1, g2] }]).get("2026-10-23");
  assert.deepEqual([e.titulo, e.fin, e.calendarioId], ["Ensayo General | Banda de Música de Noia", H(23, 30), "g1"]);
  assert.deepEqual(finesDistintos(e), [H(24)]);
});

test("si una copia está en un calendario tuyo, esa es la que se muestra", () => {
  const compartido = cal("banda@group", "Banda", "reader"), mio = cal(YO, YO, "owner", { principal: true });
  const cuentas = [{ id: YO, calendarios: [compartido, mio] }];
  const evs = [...ev(compartido, "x", "Ensayo General | Banda", "2026-10-30T21:30:00+01:00", "2026-10-30T23:30:00+01:00"),
    ...ev(mio, "y", "Ensayo", "2026-10-30T21:30:00+01:00", "2026-10-30T23:00:00+01:00")];
  const [e] = indexar({ [YO]: evs }, cuentas).get("2026-10-30");
  assert.equal(e.calendarioId, YO);
  assert.equal(e.titulo, "Ensayo");
  assert.deepEqual(e.fuentes.map((f) => f.calendarioId), ["banda@group"]);
});

test("no se unen: otra hora de inicio, otro día o un evento de todo el día", () => {
  const c = cal(YO, YO, "owner", { principal: true });
  const evs = [...ev(c, "1", "Ensayo", "2026-10-23T21:30:00+02:00", "2026-10-23T23:30:00+02:00"),
    ...ev(c, "2", "Ensayo", "2026-10-23T20:00:00+02:00", "2026-10-23T21:00:00+02:00"),
    ...convertirEvento({ id: "3", summary: "Ensayo", start: { date: "2026-10-23" }, end: { date: "2026-10-24" } }, c, YO)];
  assert.equal(indexar({ [YO]: evs }, [{ id: YO, calendarios: [c] }]).get("2026-10-23").length, 3);
});

test("los festivos en dos idiomas de dos cuentas no se confunden; los iguales sí se unen", () => {
  const a = cal("es#holiday", "Festivos en España", "reader"), b = cal("en#holiday", "Holidays in Spain", "reader");
  const fiesta = (c, id, t) => convertirEvento({ id, summary: t, start: { date: "2026-11-01" }, end: { date: "2026-11-02" } }, c, YO);
  const evs = [...fiesta(a, "f1", "Todos los Santos"), ...fiesta(b, "f2", "All Saints' Day"), ...fiesta(b, "f3", "Todos los Santos")];
  const dia = indexar({ [YO]: evs }, [{ id: YO, calendarios: [a, b] }]).get("2026-11-01");
  assert.deepEqual(dia.map((e) => e.titulo).sort(), ["All Saints' Day", "Todos los Santos"]);
});

test("cuerpo del evento: hora local con zona, fin pasada la medianoche y todo el día", () => {
  assert.deepEqual(cuerpoEvento({ titulo: "Dentista", dia: "2026-10-27", inicio: H(10, 30), fin: H(11, 30) }, "Europe/Madrid"), {
    summary: "Dentista", description: "Creado desde Pauta.",
    start: { dateTime: "2026-10-27T10:30:00", timeZone: "Europe/Madrid" }, end: { dateTime: "2026-10-27T11:30:00", timeZone: "Europe/Madrid" },
  });
  const tarde = cuerpoEvento({ titulo: "Concierto", dia: "2026-10-31", inicio: H(23), fin: H(25) }, "Europe/Madrid");
  assert.equal(tarde.end.dateTime, "2026-11-01T01:00:00");
  const dia = cuerpoEvento({ titulo: "Mudanza", dia: "2026-10-25", todoElDia: true }, "Europe/Madrid");
  assert.deepEqual([dia.start, dia.end], [{ date: "2026-10-25" }, { date: "2026-10-26" }]);
});

test("relectura: coincide aunque Google devuelva otro formato; se detectan diferencias", () => {
  const pedido = cuerpoEvento({ titulo: "Dentista", dia: "2026-10-27", inicio: H(10, 30), fin: H(11, 30) }, "Europe/Madrid");
  const igual = { id: "n1", status: "confirmed", summary: "Dentista", start: { dateTime: "2026-10-27T10:30:00+01:00", timeZone: "Europe/Madrid" }, end: { dateTime: "2026-10-27T10:30:00Z" } };
  assert.deepEqual(comprobarEvento(pedido, igual), []); // 10:30 Z = 11:30 en Madrid tras el cambio de hora
  assert.deepEqual(comprobarEvento(pedido, { ...igual, summary: "Dentist" }), ["El título en Google es «Dentist»."]);
  assert.equal(comprobarEvento(pedido, { ...igual, start: { dateTime: "2026-10-27T09:30:00+01:00" } }).length, 1);
  assert.deepEqual(comprobarEvento(pedido, { ...igual, status: "cancelled" }), ["El evento no aparece en Google."]);
  const todo = cuerpoEvento({ titulo: "Mudanza", dia: "2026-10-25", todoElDia: true }, "Europe/Madrid");
  assert.deepEqual(comprobarEvento(todo, { summary: "Mudanza", start: { date: "2026-10-25" }, end: { date: "2026-10-26" } }), []);
});

test("solo se escribe en calendarios tuyos, el principal primero", () => {
  const c = { calendarios: [cal("fam", "Familia", "owner"), cal("banda", "Banda", "reader"), cal(YO, YO, "owner", { principal: true }), cal("fest", "Festivos", "reader")] };
  assert.deepEqual(calendariosPropios(c).map((x) => x.id), [YO, "fam"]);
});
