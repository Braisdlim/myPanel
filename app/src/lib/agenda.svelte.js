// La agenda que ven las pantallas: tus calendarios reales si has conectado alguna cuenta; si no, los de ejemplo.
import { app } from "./estado.svelte.js";
import { indexar, ordenar, clavesDe, bloquea } from "./calendario.js";
export { bloquea };
import * as ejemplo from "./ejemplo.js";
import { sumarDias } from "./fechas.js";

export { conflictos, carriles } from "./ejemplo.js";

const indice = $derived(indexar(app.eventos, app.cuentas));

/** ¿Hay al menos una cuenta real? Entonces desaparecen los calendarios de ejemplo. */
export const esReal = () => app.cuentas.length > 0;

export const cuentas = () => (esReal() ? app.cuentas : ejemplo.CUENTAS);
export const cuenta = (id) => cuentas().find((c) => c.id === id) ?? { id, nombre: "Cuenta desconectada", proveedor: "", color: "c4", escritura: false };

export function eventosDelDia(dia, hoy) {
  if (!esReal()) return ejemplo.eventosDelDia(dia, hoy);
  // Los cambios de hora no vienen de ninguna cuenta: son avisos de Pauta y se quedan
  const avisos = ejemplo.eventosDelDia(dia, hoy).filter((e) => !e.cuenta);
  const marcados = new Set(app.noVoy);
  const evs = (indice.get(dia) ?? []).map((e) => (clavesDe(e).some((k) => marcados.has(k)) ? { ...e, noVoy: true } : e));
  return [...avisos, ...evs].sort(ordenar);
}

export function eventosEntre(desde, hasta, hoy) {
  const out = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) out.push(...eventosDelDia(d, hoy));
  return out;
}

export function horasDelDia(dia, hoy) {
  return eventosDelDia(dia, hoy).filter(bloquea).reduce((s, e) => s + (e.fin - e.inicio), 0) / 60;
}

/** Desde cuándo y hasta cuándo hay eventos guardados (la ventana de la última actualización). */
export function ventana() {
  const s = Object.values(app.sync).filter((x) => x.desde);
  if (!s.length) return null;
  return { desde: s.map((x) => x.desde).sort()[0], hasta: s.map((x) => x.hasta).sort().at(-1) };
}

/** La actualización más antigua de todas las cuentas (lo que puede estar desfasado). */
export function ultimaActualizacion() {
  const s = app.cuentas.map((c) => app.sync[c.id]?.actualizado).filter(Boolean).sort();
  return s.length === app.cuentas.length ? s[0] : null;
}
