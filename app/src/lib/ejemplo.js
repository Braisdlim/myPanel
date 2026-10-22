// Datos de EJEMPLO para lo que aún no está conectado: calendarios de las tres cuentas y finanzas.
// Se generan alrededor de la fecha real para que la app parezca viva. Todo lleva `ejemplo: true`,
// salvo el ensayo de los viernes (21:30–23:30), que es un hecho real; su cuenta está por confirmar (P-001).
import { sumarDias, diaSemana, ultimoDomingo, diasEntre } from "./fechas.js";

export const CUENTAS = [
  { id: "gmail1", nombre: "Gmail 1", proveedor: "Google", color: "c1", escritura: false, correo: "[correo de Gmail 1]" },
  { id: "gmail2", nombre: "Gmail 2", proveedor: "Google", color: "c2", escritura: true, correo: "[correo de Gmail 2]" },
  { id: "outlook", nombre: "Outlook", proveedor: "Microsoft", color: "c3", escritura: false, correo: "[correo de Outlook]" },
];
export const cuenta = (id) => CUENTAS.find((c) => c.id === id);

const H = (h, m = 0) => h * 60 + m;
// Pseudoaleatorio estable por fecha: los mismos datos en cada visita.
function azar(texto) {
  let h = 2166136261;
  for (const c of texto) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}

const ev = (dia, cuentaId, titulo, inicio, fin, extra = {}) => ({ id: `${dia}-${cuentaId}-${titulo}`, dia, cuenta: cuentaId, titulo, inicio, fin, todoElDia: false, opcional: false, lugar: "", ejemplo: true, ...extra });

export function eventosDelDia(dia, hoy) {
  const out = [];
  const dow = diaSemana(dia);
  const rel = diasEntre(hoy, dia);
  const anio = Number(dia.slice(0, 4));
  if (dia === ultimoDomingo(anio, 10)) out.push(ev(dia, "gmail1", "Cambio de hora: 3:00 → 2:00", 0, 0, { todoElDia: true, cuenta: null, ejemplo: false }));
  if (dia === ultimoDomingo(anio, 3)) out.push(ev(dia, "gmail1", "Cambio de hora: 2:00 → 3:00", 0, 0, { todoElDia: true, cuenta: null, ejemplo: false }));

  if (dow < 5) out.push(ev(dia, "outlook", "Reunión diaria del equipo", H(9, 30), H(9, 45), { lugar: "Teams" }));
  if (dow === 1 || dow === 3) out.push(ev(dia, "outlook", "Revisión del proyecto", H(11), H(12)));
  if (dow === 4) out.push(ev(dia, "gmail2", "Ensayo", H(21, 30), H(23, 30), { opcional: true, ejemplo: false, nota: "Cada viernes. Es opcional: se puede saltar solo una vez." }));
  if (dow === 6 && azar(dia + "comida") < 0.5) out.push(ev(dia, "gmail2", "Comida familiar", H(14), H(16)));

  if (rel === 0) {
    out.push(ev(dia, "gmail1", "Revisión del coche", H(10), H(11), { lugar: "Taller" }));
    out.push(ev(dia, "gmail2", "Comida con Marta", H(13, 30), H(15)));
    out.push(ev(dia, "gmail1", "Médico", H(17, 30), H(18, 30), { lugar: "Centro de salud" }));
  } else if (rel === 1) {
    out.push(ev(dia, "gmail2", "Ruta en bici", H(10), H(13)));
    out.push(ev(dia, "outlook", "Reunión de la comunidad", H(12), H(13)));
  } else if (rel === 3) {
    out.push(ev(dia, "gmail1", "Dentista", H(17), H(17, 45)));
  } else if (rel === 6) {
    out.push(ev(dia, "gmail2", "Cena de cumpleaños de Ana", H(21), H(23, 30)));
  } else if (rel === 9) {
    out.push(ev(dia, "gmail1", "Vence el seguro del coche", 0, 0, { todoElDia: true }));
  } else if (rel !== 2) {
    // Relleno estable para que la semana, el mes y el año tengan vida
    const r = azar(dia);
    if (dow < 5 && r < 0.45) out.push(ev(dia, "outlook", ["Llamada con cliente", "Formación", "Entrevista técnica", "Planificación del sprint"][Math.floor(r * 8.9) % 4], H(15 + Math.floor(r * 4)), H(16 + Math.floor(r * 4))));
    if (r > 0.7) out.push(ev(dia, r > 0.85 ? "gmail1" : "gmail2", ["Gimnasio", "Café con Laura", "Cine", "Clase de inglés", "Recoger un paquete"][Math.floor(r * 50) % 5], H(19), H(r > 0.85 ? 20 : 21)));
    if (dow === 5 && r < 0.4) out.push(ev(dia, "gmail2", "Excursión", H(9), H(14)));
  }
  return out.sort((a, b) => b.todoElDia - a.todoElDia || a.inicio - b.inicio);
}

export function eventosEntre(desde, hasta, hoy) {
  const out = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) out.push(...eventosDelDia(d, hoy));
  return out;
}

/** Pares de eventos de cuentas distintas que se pisan (lo que ninguna cuenta ve por separado). */
export function conflictos(evs) {
  const r = [];
  const conHora = evs.filter((e) => !e.todoElDia);
  for (let i = 0; i < conHora.length; i++) for (let j = i + 1; j < conHora.length; j++) {
    const a = conHora[i], b = conHora[j];
    if (a.dia === b.dia && a.cuenta !== b.cuenta && a.inicio < b.fin && b.inicio < a.fin && !a.opcional && !b.opcional && !a.noVoy && !b.noVoy) r.push([a, b]);
  }
  return r;
}

/** Carriles para pintar eventos que se solapan uno al lado del otro. */
export function carriles(evs) {
  const ord = [...evs].sort((a, b) => a.inicio - b.inicio || b.fin - a.fin);
  const grupos = [];
  for (const e of ord) {
    const g = grupos.find((g) => g.fin > e.inicio);
    if (g) { g.items.push(e); g.fin = Math.max(g.fin, e.fin); } else grupos.push({ fin: e.fin, items: [e] });
  }
  const out = new Map();
  for (const g of grupos) {
    const fines = [];
    for (const e of g.items) {
      let k = fines.findIndex((f) => f <= e.inicio);
      if (k === -1) { k = fines.length; fines.push(0); }
      fines[k] = e.fin;
      out.set(e.id, { carril: k });
    }
    for (const e of g.items) out.get(e.id).carriles = fines.length;
  }
  return out;
}

/** Horas comprometidas de un día (para el mapa anual). */
export function horasDelDia(dia, hoy) {
  return eventosDelDia(dia, hoy).filter((e) => !e.todoElDia && !e.opcional).reduce((s, e) => s + (e.fin - e.inicio), 0) / 60;
}

// ---------- Finanzas de ejemplo ----------
export const FONDOS = [
  { id: "mundial", nombre: "Fondo indexado mundial", tipo: "Fondo indexado · renta variable", isin: "[ISIN]", participaciones: 412.37, aportado: 5200, deriva: 0.00035, vol: 0.008, base: 14.2 },
  { id: "emergentes", nombre: "Fondo indexado emergentes", tipo: "Fondo indexado · renta variable", isin: "[ISIN]", participaciones: 96.4, aportado: 1200, deriva: 0.0001, vol: 0.011, base: 12.6 },
  { id: "rentafija", nombre: "Renta fija a corto plazo", tipo: "Fondo · renta fija", isin: "[ISIN]", participaciones: 31.8, aportado: 3000, deriva: 0.00012, vol: 0.0012, base: 92.5 },
];

/** Valor liquidativo diario de los últimos `dias` días hasta `ultimo` (los fondos publican con un día de retraso). */
export function serie(fondo, ultimo, dias = 1100) {
  const puntos = [];
  let v = fondo.base;
  for (let i = dias; i >= 0; i--) {
    const d = sumarDias(ultimo, -i);
    if (diaSemana(d) >= 5) continue;
    const r = azar(fondo.id + d);
    v *= 1 + fondo.deriva + (r - 0.5) * 2 * fondo.vol;
    puntos.push({ dia: d, v });
  }
  return puntos;
}

export const euros = (x, dec = 2) => x.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + " €";
export const porcentaje = (x) => `${x > 0 ? "↑ +" : x < 0 ? "↓ −" : ""}${Math.abs(x * 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
