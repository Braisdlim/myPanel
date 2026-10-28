// El asistente en la app (D-061 a D-063): junta tus datos (o los de la persona de ejemplo), busca con el motor,
// redacta con el modelo elegido y comprueba las citas. La conversación no se guarda; las claves, solo en memoria.
import { app, leerVectores, guardarVectores, cambiarAsistente } from "../estado.svelte.js";
import { eventosEntre, cuenta as cuentaReal, esReal } from "../agenda.svelte.js";
import { sumarDias } from "../fechas.js";
import { crearFragmentos, textoIndexable } from "./fragmentos.js";
import { crearMotor } from "./motor.js";
import { respuestaSinModelo, mensajes as mensajesModelo, validarCitas } from "./respuesta.js";
import { preguntarModelo, proveedor } from "./proveedores.js";
import { datosDemo, CUENTAS_DEMO } from "./demo.js";
import { MODELO } from "./embeddings.js";

export const asis = $state({
  mensajes: [], // { id, de: "tu"|"pauta", texto, ... }
  ocupado: false,
  vectores: { estado: "apagado", progreso: 0, mensaje: "" }, // apagado | descargando | indexando | listo | error
  claves: {}, // proveedor → clave (solo en memoria; opcionalmente en esta pestaña)
});

const CLAVES = "pauta-claves-asistente";
try { asis.claves = JSON.parse(sessionStorage.getItem(CLAVES) ?? "{}"); } catch { /* sin sessionStorage */ }
export function ponerClave(id, clave, recordar) {
  asis.claves = { ...asis.claves, [id]: clave.trim() };
  try { recordar ? sessionStorage.setItem(CLAVES, JSON.stringify(asis.claves)) : sessionStorage.removeItem(CLAVES); } catch { /* nada */ }
}
export function olvidarClaves() { asis.claves = {}; try { sessionStorage.removeItem(CLAVES); } catch { /* nada */ } }

// ---------- qué datos usa ----------
const tienesDatos = () => esReal() || app.tareas.length > 0 || app.memoria.length > 0 || app.notas.length > 0;
export const usaDemo = () => app.ajustes.asistente.datos === "demo" || (app.ajustes.asistente.datos === "auto" && !tienesDatos());

export function fragmentosActuales() {
  const hoy = app.hoy;
  if (usaDemo()) return crearFragmentos(datosDemo(hoy), { hoy, cuenta: (id) => CUENTAS_DEMO.find((c) => c.id === id) });
  const eventos = esReal() ? eventosEntre(sumarDias(hoy, -60), sumarDias(hoy, 180), hoy).filter((e) => e.cuenta) : [];
  return crearFragmentos({ eventos, tareas: app.tareas, memoria: app.memoria, notas: app.notas }, { hoy, cuenta: cuentaReal });
}

// ---------- vectores (búsqueda por significado, opcional) ----------
let trabajador = null, siguiente = 0;
const pendientes = new Map();
const cache = new Map(); // huella del texto → Float32Array
let cacheLeida = false;

function enTrabajador(textos, tipo) {
  trabajador ??= Object.assign(new Worker(new URL("./vectores.worker.js", import.meta.url), { type: "module" }), {
    onmessage: ({ data }) => {
      const p = pendientes.get(data.id);
      if (!p) return;
      if (data.progreso) {
        const x = data.progreso;
        if (x.status === "progress" && x.total) { asis.vectores.estado = "descargando"; asis.vectores.progreso = Math.round((x.loaded / x.total) * 100); }
        return;
      }
      pendientes.delete(data.id);
      data.error ? p.mal(new Error(data.error)) : p.ok(data.vectores);
    },
  });
  const id = ++siguiente;
  return new Promise((ok, mal) => { pendientes.set(id, { ok, mal }); trabajador.postMessage({ id, textos, tipo }); });
}

/** Huella corta del texto (FNV-1a) + modelo: si el fragmento cambia, se recalcula su vector. */
const huella = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return `${MODELO}|${(h >>> 0).toString(36)}|${t.length}`; };

/** Vectores de todos los fragmentos (calcula solo los nuevos, de 16 en 16). */
async function vectoresDe(fragmentos) {
  if (!cacheLeida) { for (const v of await leerVectores()) cache.set(v.id, Float32Array.from(v.v)); cacheLeida = true; }
  const faltan = fragmentos.filter((f) => !cache.has(huella(textoIndexable(f))));
  if (faltan.length) {
    asis.vectores.estado = asis.vectores.estado === "descargando" ? "descargando" : "indexando";
    for (let i = 0; i < faltan.length; i += 16) {
      const lote = faltan.slice(i, i + 16);
      const vs = await enTrabajador(lote.map(textoIndexable), "fragmento");
      const nuevos = lote.map((f, k) => ({ id: huella(textoIndexable(f)), v: Array.from(vs[k]) }));
      for (const n of nuevos) cache.set(n.id, Float32Array.from(n.v));
      await guardarVectores(nuevos);
      asis.vectores.estado = "indexando";
      asis.vectores.progreso = Math.round(((i + lote.length) / faltan.length) * 100);
    }
  }
  asis.vectores = { estado: "listo", progreso: 100, mensaje: `${fragmentos.length} fragmentos con vector` };
  return new Map(fragmentos.map((f) => [f.id, cache.get(huella(textoIndexable(f)))]));
}

/** Enciende la búsqueda por significado: descarga el modelo (una vez) y calcula los vectores. */
export async function activarVectores() {
  await cambiarAsistente("vectores", true);
  try { asis.vectores = { estado: "descargando", progreso: 0, mensaje: "" }; await vectoresDe(fragmentosActuales()); }
  catch (e) { asis.vectores = { estado: "error", progreso: 0, mensaje: e.message }; }
}
export async function desactivarVectores() { await cambiarAsistente("vectores", false); asis.vectores = { estado: "apagado", progreso: 0, mensaje: "" }; }

// ---------- preguntar ----------
let ctl = null;
const nuevoMensaje = (m) => { const x = { id: crypto.randomUUID?.() ?? String(Math.random()), ...m }; asis.mensajes.push(x); return asis.mensajes.at(-1); };

export async function preguntar(texto, { forzarEnvio = false } = {}) {
  texto = texto.trim();
  if (!texto || asis.ocupado) return;
  if (!forzarEnvio) nuevoMensaje({ de: "tu", texto });
  asis.ocupado = true;
  const m = nuevoMensaje({ de: "pauta", estado: "buscando", texto: "", pregunta: texto });
  try {
    const conf = app.ajustes.asistente;
    const fragmentos = fragmentosActuales();
    let vectores = null;
    if (conf.vectores) {
      try { vectores = await vectoresDe(fragmentos); }
      catch (e) { asis.vectores = { estado: "error", progreso: 0, mensaje: e.message }; }
    }
    const motor = crearMotor(fragmentos, vectores ? { vectores, embeber: async (t) => (await enTrabajador([t], "consulta"))[0] } : {});
    const r = await motor.preguntar(texto, { hoy: app.hoy, ahora: app.ahora });
    Object.assign(m, { ruta: r.ruta, explicacion: r.explicacion, fuentes: r.resultados.map((x) => ({ ...x.f })), demo: usaDemo(), vectores: !!vectores, total: fragmentos.length });
    const deCodigo = respuestaSinModelo(r, app.hoy);
    const p = proveedor(conf.proveedor);
    if (p.id === "ninguno" || r.abstener) { Object.assign(m, { estado: "listo", texto: deCodigo, redacta: "codigo" }); return; }
    // Con tus datos, antes del primer envío se pide permiso: solo salen los fragmentos encontrados
    if (!usaDemo() && !conf.avisoEnvio && !forzarEnvio) {
      Object.assign(m, { estado: "permiso", texto: deCodigo, redacta: "codigo", proveedor: p.nombre, enviaria: r.resultados.length });
      return;
    }
    m.estado = "redactando";
    ctl = new AbortController();
    try {
      const salida = await preguntarModelo({ id: p.id, clave: asis.claves[p.id] ?? "", modelo: conf.modelo, mensajes: mensajesModelo(texto, r, app.hoy), signal: ctl.signal });
      const v = validarCitas(salida.texto, r.resultados.length);
      if (!v.texto) throw new Error("El modelo no respondió nada.");
      Object.assign(m, { estado: "listo", texto: v.texto, redacta: "modelo", proveedor: p.nombre, modelo: salida.modelo,
        aviso: v.invalidas.length ? `Quité ${v.invalidas.length === 1 ? "una cita que no existía" : `${v.invalidas.length} citas que no existían`}.` : v.sinCitas ? "El modelo no citó ninguna fuente: tómalo con cuidado." : null });
    } catch (e) {
      Object.assign(m, { estado: "listo", texto: deCodigo, redacta: "codigo", aviso: `${e.message} Te respondo sin IA, con lo que he encontrado.` });
    }
  } catch (e) {
    Object.assign(m, { estado: "listo", texto: "Algo ha fallado al buscar.", aviso: e.message, fuentes: [] });
  } finally { asis.ocupado = false; ctl = null; }
}

/** «Enviar» tras el aviso de permiso: recuerda el permiso y vuelve a preguntar lo mismo. */
export async function permitirEnvio(m) {
  await cambiarAsistente("avisoEnvio", true);
  asis.mensajes = asis.mensajes.filter((x) => x.id !== m.id);
  await preguntar(m.pregunta, { forzarEnvio: true });
}
export function parar() { ctl?.abort(); }
export function limpiarConversacion() { asis.mensajes = []; }
