// Estado de la app (Svelte 5): ruta, fecha de hoy, tareas guardadas en el dispositivo y ajustes.
import { crearAlmacen } from "./almacen.js";
import { hoyISO, minutosAhora } from "./fechas.js";
import { crearTarea, crearProyecto, completar } from "./tareas.js";

export const SECTORES = [
  { id: "hoy", nombre: "Hoy", icono: "sun" },
  { id: "calendario", nombre: "Calendario", icono: "calendar" },
  { id: "tareas", nombre: "Tareas", icono: "circle-check" },
  { id: "finanzas", nombre: "Finanzas", icono: "trending-up" },
  { id: "atencion", nombre: "Pide atención", icono: "bell" },
  { id: "asistente", nombre: "Asistente", icono: "sparkles" },
];

const AJUSTES_INICIALES = { id: "general", tema: "sistema", guardarEn: "preguntar" };

export const app = $state({
  hoy: hoyISO(),
  ahora: minutosAhora(),
  ruta: ["hoy"],
  tareas: [],
  proyectos: [],
  ajustes: { ...AJUSTES_INICIALES },
  cargado: false,
  persistente: true,
  movil: false,
  apuntar: { abierto: false, texto: "" },
  aviso: null,
});

let almacen;

export async function iniciar() {
  almacen = await crearAlmacen();
  app.persistente = almacen.persistente;
  const [tareas, proyectos, ajustes] = await Promise.all([almacen.todos("tareas"), almacen.todos("proyectos"), almacen.todos("ajustes")]);
  app.tareas = tareas;
  app.proyectos = proyectos.sort((a, b) => a.orden - b.orden);
  app.ajustes = { ...AJUSTES_INICIALES, ...(ajustes.find((a) => a.id === "general") ?? {}) };
  app.cargado = true;
  leerRuta();
  addEventListener("hashchange", leerRuta);
  setInterval(() => { app.hoy = hoyISO(); app.ahora = minutosAhora(); }, 30_000);
}

// ---------- ruta (#/sector/…) ----------
function leerRuta() {
  const partes = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  app.ruta = partes.length && SECTORES.concat({ id: "ajustes" }).some((s) => s.id === partes[0]) ? partes : ["hoy"];
}
export function ir(...partes) {
  const h = "#/" + partes.map(encodeURIComponent).join("/");
  if (location.hash !== h) location.hash = h; else leerRuta();
}

// ---------- tareas ----------
export async function guardarTarea(t) {
  const i = app.tareas.findIndex((x) => x.id === t.id);
  if (i === -1) app.tareas.push(t); else app.tareas[i] = t;
  await almacen.guardar("tareas", t);
}
export async function nuevaTarea(datos) {
  const t = crearTarea(datos);
  await guardarTarea(t);
  avisar(`Apuntada: ${t.titulo}`);
  return t;
}
export async function alternar(t) { await guardarTarea(completar(t)); }
export async function borrarTarea(t) {
  app.tareas = app.tareas.filter((x) => x.id !== t.id);
  await almacen.borrar("tareas", t.id);
  avisar(`Borrada: ${t.titulo}`);
}
export async function nuevoProyecto(nombre) {
  const p = crearProyecto(nombre);
  app.proyectos.push(p);
  await almacen.guardar("proyectos", p);
  return p;
}

// ---------- ajustes ----------
export async function cambiarAjuste(clave, valor) {
  app.ajustes[clave] = valor;
  await almacen.guardar("ajustes", { ...app.ajustes });
}

/** Exporta todo lo guardado en el dispositivo (las tareas y proyectos son tuyos). */
export function exportar() {
  return JSON.stringify({ app: "Pauta", version: 1, exportado: new Date().toISOString(), tareas: app.tareas, proyectos: app.proyectos }, null, 2);
}
export async function borrarTodo() {
  await almacen.vaciar();
  app.tareas = []; app.proyectos = []; app.ajustes = { ...AJUSTES_INICIALES };
}

let temporizador;
export function avisar(texto) {
  app.aviso = texto;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (app.aviso = null), 3200);
}
