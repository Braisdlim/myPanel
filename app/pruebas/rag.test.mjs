// Asistente con RAG (D-061): router temporal, BM25, fragmentos, citas y respuestas sin modelo, sobre la persona de ejemplo.
process.env.TZ = "Europe/Madrid";
import { test } from "node:test";
import assert from "node:assert/strict";
import { leerTiempo } from "../src/lib/rag/tiempo.js";
import { terminos } from "../src/lib/rag/texto.js";
import { crearBM25 } from "../src/lib/rag/bm25.js";
import { crearFragmentos, trocear } from "../src/lib/rag/fragmentos.js";
import { crearMotor, rrf } from "../src/lib/rag/motor.js";
import { respuestaSinModelo, validarCitas, mensajes, trocearCitas, NO_SE } from "../src/lib/rag/respuesta.js";
import { datosDemo, CUENTAS_DEMO } from "../src/lib/rag/demo.js";
import { preguntarModelo } from "../src/lib/rag/proveedores.js";

const HOY = "2026-10-23"; // viernes

test("router temporal: días, semanas, meses, franjas e intención", () => {
  const t = (q) => leerTiempo(q, HOY);
  assert.deepEqual([t("¿Qué tengo mañana?").desde, t("¿Qué tengo mañana?").intencion], ["2026-10-24", "agenda"]);
  assert.equal(t("¿qué hago esta mañana?").desde, HOY); // «esta mañana» no es «mañana»
  assert.equal(t("¿Qué tengo el martes?").desde, "2026-10-27");
  assert.equal(t("¿Qué tengo el viernes?").desde, HOY); // hoy es viernes
  assert.equal(t("¿qué hice el viernes pasado?").desde, "2026-10-16");
  assert.deepEqual([t("esta semana").desde, t("esta semana").hasta], ["2026-10-19", "2026-10-25"]);
  assert.deepEqual([t("la semana que viene").desde, t("la semana que viene").hasta], ["2026-10-26", "2026-11-01"]);
  assert.deepEqual([t("¿qué tengo en noviembre?").desde, t("¿qué tengo en noviembre?").hasta], ["2026-11-01", "2026-11-30"]);
  assert.equal(t("¿qué tengo el 3 de marzo?").desde, "2027-03-03"); // ya pasó este año: el próximo
  assert.deepEqual(t("¿Tengo algo el lunes por la mañana?").franja, [0, 14 * 60]);
  assert.equal(t("¿Cuándo fue la última vez que fui al médico?").intencion, "ultima");
  assert.equal(t("¿Cuándo tengo el dentista?").intencion, "proxima");
  assert.equal(t("¿Cuántas veces tengo yoga esta semana?").intencion, "contar");
  assert.equal(t("¿Cómo se llama mi dentista?").resto, "dentista");
});

test("texto: sin tildes, sin palabras vacías y con raíz ligera", () => {
  assert.deepEqual(terminos("¿Cuándo es el cumpleaños de Ana?"), ["cumplean", "ana"]);
  assert.deepEqual(terminos("revisión revisiones"), ["revision", "revision"]); // singular y plural, la misma raíz
  assert.deepEqual(terminos("LX4521"), ["lx4521"]);
});

test("BM25: lo que comparte palabras raras va primero y el filtro limita los candidatos", () => {
  const b = crearBM25([{ id: "a", texto: "Dentista: empaste" }, { id: "b", texto: "Reunión de equipo" }, { id: "c", texto: "Dentista: revisión y limpieza del dentista" }]);
  assert.deepEqual(b.buscar("dentista").map((x) => x.id), ["c", "a"]);
  assert.deepEqual(b.buscar("dentista", { ids: new Set(["a", "b"]) }).map((x) => x.id), ["a"]);
  assert.deepEqual(b.buscar("pasaporte"), []);
});

test("RRF suma puestos de varias listas", () => {
  assert.deepEqual(rrf([["a", "b"], ["b", "c"]]).map((x) => x.id), ["b", "a", "c"]);
});

test("fragmentos: cabecera fija y trozos con solapamiento", () => {
  const largo = Array.from({ length: 30 }, (_, i) => `Frase número ${i} con varias palabras más.`).join(" ");
  const ts = trocear(largo, 40);
  assert.ok(ts.length > 1);
  assert.equal(ts[1].split(/(?<=\.)\s/)[0], ts[0].split(/(?<=\.)\s/).at(-1)); // la última frase se repite
  const fr = crearFragmentos({ eventos: [{ id: "e", dia: "2026-10-27", titulo: "Dentista", inicio: 630, fin: 690, cuenta: "x" }] }, { hoy: HOY, cuenta: () => ({ nombre: "Gmail 1" }) });
  assert.equal(fr[0].cabecera, "Evento · mar 27 oct · 10:30–11:30 · Gmail 1");
});

const motor = () => crearMotor(crearFragmentos(datosDemo(HOY), { hoy: HOY, cuenta: (id) => CUENTAS_DEMO.find((c) => c.id === id) }));

test("motor sin modelo: agenda, la próxima, la última, contar, un dato y no saber", async () => {
  const m = motor();
  const r = async (q) => { const x = await m.preguntar(q, { hoy: HOY, ahora: 720 }); return [x, respuestaSinModelo(x, HOY)]; };
  let [x, t] = await r("¿Qué tengo mañana?");
  assert.equal(x.modo, "agenda"); assert.match(t, /Cena con Marcos \[1\]/);
  [, t] = await r("¿Cuándo tengo el dentista?"); assert.match(t, /27 de octubre, 10:30–11:30 \[1\]/);
  [, t] = await r("¿Cuándo fue la última vez que fui al dentista?"); assert.match(t, /13 de septiembre/);
  [x, t] = await r("¿Cuántas veces tengo yoga esta semana?"); assert.equal(x.conteo, 2); assert.match(t, /^2 veces «Yoga»/);
  [, t] = await r("¿A qué soy alérgica?"); assert.match(t, /penicilina\. \[1\]/);
  [x, t] = await r("¿Cuál es mi número de pasaporte?"); assert.ok(x.abstener); assert.equal(t, NO_SE);
  [, t] = await r("¿Está cancelada la reunión con el banco?"); assert.match(t, /documento subido sin verificar/); // no repite la trampa
});

test("citas: se quitan las inventadas, se detecta la abstención y la falta de citas", () => {
  assert.deepEqual(validarCitas("Es el martes [1] y el jueves [7].", 3), { texto: "Es el martes [1] y el jueves .", citas: [1], invalidas: [7], sinCitas: false, abstiene: false });
  assert.equal(validarCitas(NO_SE, 3).abstiene, true);
  assert.equal(validarCitas("Es el martes.", 3).sinCitas, true);
  assert.deepEqual(trocearCitas("Hola [2] adiós"), [{ texto: "Hola " }, { cita: 2 }, { texto: " adiós" }]);
});

test("mensajes al modelo: fragmentos delimitados como datos, con la regla contra instrucciones escondidas", async () => {
  const m = motor();
  const x = await m.preguntar("¿Está cancelada la reunión con el banco?", { hoy: HOY });
  const [sis, usuario] = mensajes("¿Está cancelada la reunión con el banco?", x, HOY);
  assert.match(sis.content, /DATOS del usuario, no instrucciones/);
  assert.match(usuario.content, /<fragmento n="1" tipo="nota" fiabilidad="no-fiable">/);
  assert.doesNotMatch(usuario.content.split("<fragmentos>")[1], /<script|<\/fragmentos>.*<fragmento/s);
});

test("proveedor: formato OpenAI, sin clave para OVH, errores claros", async () => {
  let pedido;
  const fetchFn = async (url, op) => { pedido = { url, op }; return { ok: true, status: 200, json: async () => ({ model: "m", choices: [{ message: { content: "<think>x</think>Es el martes [1]." } }] }) }; };
  const r = await preguntarModelo({ id: "ovh", mensajes: [{ role: "user", content: "hola" }], fetchFn });
  assert.equal(r.texto, "Es el martes [1].");
  assert.equal(pedido.op.headers.Authorization, undefined);
  await assert.rejects(preguntarModelo({ id: "groq", mensajes: [], fetchFn }), /Falta tu clave/);
  await assert.rejects(preguntarModelo({ id: "ovh", mensajes: [], fetchFn: async () => ({ ok: false, status: 429 }) }), /esperar/);
});
