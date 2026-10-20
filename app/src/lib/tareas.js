// Tareas al estilo de Things (D-039): listas fijas, proyectos y «Cuándo». Funciones puras; el estado vive en estado.svelte.js.
import { nuevoId } from "./almacen.js";

export const LISTAS = [
  { id: "entrada", nombre: "Entrada", icono: "inbox" },
  { id: "hoy", nombre: "Hoy", icono: "sun" },
  { id: "programadas", nombre: "Programadas", icono: "calendar-days" },
  { id: "cualquier", nombre: "En cualquier momento", icono: "layers" },
  { id: "algun", nombre: "Algún día", icono: "archive" },
  { id: "registro", nombre: "Registro", icono: "book-check" },
];

export function crearTarea(datos = {}) {
  return {
    id: nuevoId(),
    titulo: "",
    notas: "",
    lista: "entrada",
    proyectoId: null,
    cuando: null,
    inicio: null,
    duracionMin: null,
    limite: null,
    hecha: false,
    hechaEn: null,
    creada: new Date().toISOString(),
    orden: Date.now(),
    comprobacion: [],
    ...datos,
  };
}

export function crearProyecto(nombre) {
  return { id: nuevoId(), nombre, area: "", notas: "", creado: new Date().toISOString(), orden: Date.now() };
}

const porOrden = (a, b) => (a.inicio ?? 1e9) - (b.inicio ?? 1e9) || a.orden - b.orden;
const pendientes = (ts) => ts.filter((t) => !t.hecha);

/** Lo de hoy: con fecha de hoy o atrasado, más lo que vence hoy. */
export function deHoy(ts, hoy) {
  return pendientes(ts).filter((t) => (t.cuando && t.cuando <= hoy) || (t.limite && t.limite <= hoy)).sort(porOrden);
}

export function filtrar(ts, lista, hoy, proyectoId = null) {
  if (proyectoId) return ts.filter((t) => t.proyectoId === proyectoId && (!t.hecha || esDeHoy(t.hechaEn, hoy))).sort((a, b) => a.hecha - b.hecha || porOrden(a, b));
  switch (lista) {
    case "entrada": return pendientes(ts).filter((t) => t.lista === "entrada" && !t.cuando && !t.proyectoId).sort(porOrden);
    case "hoy": return deHoy(ts, hoy);
    case "programadas": return pendientes(ts).filter((t) => t.cuando && t.cuando > hoy).sort((a, b) => a.cuando.localeCompare(b.cuando) || porOrden(a, b));
    case "cualquier": return pendientes(ts).filter((t) => t.lista === "cualquier" && !t.cuando).sort(porOrden);
    case "algun": return pendientes(ts).filter((t) => t.lista === "algun").sort(porOrden);
    case "registro": return ts.filter((t) => t.hecha).sort((a, b) => (b.hechaEn ?? "").localeCompare(a.hechaEn ?? ""));
    default: return [];
  }
}

function esDeHoy(ts, hoy) { return !!ts && ts.slice(0, 10) === hoy; }

export function contar(ts, hoy) {
  return Object.fromEntries(LISTAS.map((l) => [l.id, l.id === "registro" ? 0 : filtrar(ts, l.id, hoy).length]));
}

export function completar(t, hecha = !t.hecha) {
  return { ...t, hecha, hechaEn: hecha ? new Date().toISOString() : null };
}

/** Agrupa las programadas por día: [[día, tareas], …] */
export function porDia(ts) {
  const m = new Map();
  for (const t of ts) { if (!m.has(t.cuando)) m.set(t.cuando, []); m.get(t.cuando).push(t); }
  return [...m.entries()];
}

/** Minutos de tareas con duración en un día (para la capacidad del día). */
export function minutosPlaneados(ts, dia) {
  return pendientes(ts).filter((t) => t.cuando === dia).reduce((s, t) => s + (t.duracionMin ?? 0), 0);
}
