// Fechas de calendario en local. Un día es un texto «AAAA-MM-DD»; una hora, minutos desde medianoche.

export const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const DIAS_CORTOS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
export const DIAS_LETRA = ["L", "M", "X", "J", "V", "S", "D"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

const dos = (n) => String(n).padStart(2, "0");

export function aISO(d) {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function desdeISO(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d, 12); // mediodía: a salvo de los cambios de hora
}

export function hoyISO(ahora = new Date()) {
  return aISO(ahora);
}

export function minutosAhora(ahora = new Date()) {
  return ahora.getHours() * 60 + ahora.getMinutes();
}

export function sumarDias(iso, n) {
  const d = desdeISO(iso);
  d.setDate(d.getDate() + n);
  return aISO(d);
}

export function sumarMeses(iso, n) {
  const d = desdeISO(iso);
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return aISO(d);
}

/** 0 = lunes … 6 = domingo */
export function diaSemana(iso) {
  return (desdeISO(iso).getDay() + 6) % 7;
}

export function inicioSemana(iso) {
  return sumarDias(iso, -diaSemana(iso));
}

export function inicioMes(iso) {
  return iso.slice(0, 8) + "01";
}

export function diasEntre(a, b) {
  return Math.round((desdeISO(b) - desdeISO(a)) / 86400000);
}

export function existe(anio, mes, dia) {
  const d = new Date(anio, mes - 1, dia, 12);
  return d.getFullYear() === anio && d.getMonth() === mes - 1 && d.getDate() === dia;
}

/** «vie 23 oct» */
export function corta(iso) {
  const d = desdeISO(iso);
  return `${DIAS_CORTOS[diaSemana(iso)]} ${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

/** «viernes, 23 de octubre» */
export function larga(iso) {
  const d = desdeISO(iso);
  return `${DIAS[diaSemana(iso)]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** «Octubre 2026» */
export function mesAnio(iso) {
  const d = desdeISO(iso);
  const m = MESES[d.getMonth()];
  return `${m[0].toUpperCase()}${m.slice(1)} ${d.getFullYear()}`;
}

export function hora(min) {
  const h = Math.floor(min / 60) % 24;
  return `${h}:${dos(min % 60)}`;
}

export function rango(a, b) {
  return `${hora(a)}–${hora(b)}`;
}

/** «1 h 30 min», «45 min», «2 h» */
export function duracion(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** «hoy», «mañana», «ayer», «en 5 días», «hace 3 días» */
export function distancia(iso, hoy) {
  const n = diasEntre(hoy, iso);
  if (n === 0) return "hoy";
  if (n === 1) return "mañana";
  if (n === -1) return "ayer";
  return n > 0 ? `en ${n} días` : `hace ${-n} días`;
}

/** Último domingo de un mes: los cambios de hora en la UE (marzo y octubre). */
export function ultimoDomingo(anio, mes) {
  const d = new Date(anio, mes, 0, 12);
  d.setDate(d.getDate() - ((d.getDay() + 7) % 7));
  return aISO(d);
}
