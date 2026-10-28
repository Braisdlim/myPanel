// Router temporal de las preguntas (D-061): las fechas las entiende el código, no un modelo.
// «¿Qué tengo el viernes?» no se busca por parecido: es un rango de días y una consulta a la agenda.
// Devuelve el rango, la intención y la pregunta sin las palabras de tiempo (lo que queda para BM25 y vectores).
import { normalizar } from "./texto.js";
import { sumarDias, sumarMeses, diaSemana, inicioSemana, inicioMes, existe, corta, larga, MESES } from "../fechas.js";

const DSEM = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const MES_N = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const finMes = (iso) => sumarDias(sumarMeses(inicioMes(iso), 1), -1);

/**
 * @returns {{ desde: string|null, hasta: string|null, etiqueta: string|null,
 *   intencion: "agenda"|"proxima"|"ultima"|"contar"|null, franja: [number, number]|null, resto: string }}
 */
export function leerTiempo(pregunta, hoy) {
  let n = " " + normalizar(pregunta).replace(/[¿?¡!.,;:]/g, " ").replace(/\s+/g, " ") + " ";
  let desde = null, hasta = null, etiqueta = null;
  const quitar = (re) => { n = n.replace(re, " "); };
  const dia = (iso, et) => { desde = hasta = iso; etiqueta = et ?? larga(iso); };
  const rango = (a, b, et) => { desde = a; hasta = b; etiqueta = et; };
  let m;

  // Intención (antes de quitar nada)
  let intencion = null;
  if (/\b(cuantas veces|cuantos|cuantas)\b/.test(n)) intencion = "contar";
  else if (/\b(ultima vez|la ultima|el ultimo|cuando fue|cuando estuve|cuando fui|cuando pase|cuando hice|hace cuanto)\b/.test(n)) intencion = "ultima";
  else if (/\b(cuando (es|son|tengo|me toca|me voy|vuelvo|viajo|hay|sera|empieza|vence|caduca)|proxim[oa]s?|siguiente)\b/.test(n)) intencion = "proxima";
  else if (/\b(que (tengo|hay|hago|planes)|agenda|estoy libre|tengo algo|tengo planes|plan(es)? (para|de))\b/.test(n)) intencion = "agenda";
  quitar(/\b(cuantas veces|la ultima vez|ultima vez|hace cuanto)\b/g);

  // Días sueltos
  if ((m = /\bpasado manana\b/.exec(n))) { dia(sumarDias(hoy, 2)); quitar(m[0]); }
  else if ((m = /\b(?<!de la |por la |esta )manana\b/.exec(n))) { dia(sumarDias(hoy, 1), "mañana, " + larga(sumarDias(hoy, 1))); quitar(m[0]); }
  if ((m = /\banteayer\b/.exec(n))) { dia(sumarDias(hoy, -2)); quitar(m[0]); }
  else if ((m = /\bayer\b/.exec(n))) { dia(sumarDias(hoy, -1), "ayer, " + larga(sumarDias(hoy, -1))); quitar(m[0]); }
  if ((m = /\b(hoy|esta (manana|tarde|noche))\b/.exec(n))) { dia(hoy, "hoy, " + larga(hoy)); quitar(/\bhoy\b/); }

  // Semanas
  const lunes = inicioSemana(hoy);
  if ((m = /\b(esta semana)\b/.exec(n))) { rango(lunes, sumarDias(lunes, 6), "esta semana"); quitar(m[0]); }
  else if ((m = /\b(la semana que viene|la proxima semana|la semana proxima)\b/.exec(n))) { rango(sumarDias(lunes, 7), sumarDias(lunes, 13), "la semana que viene"); quitar(m[0]); }
  else if ((m = /\b(la semana pasada)\b/.exec(n))) { rango(sumarDias(lunes, -7), sumarDias(lunes, -1), "la semana pasada"); quitar(m[0]); }
  if ((m = /\b(este )?(fin de semana|finde)( que viene)?\b/.exec(n))) {
    const sab = sumarDias(lunes, diaSemana(hoy) === 6 ? 5 : 5 + (m[3] && diaSemana(hoy) >= 5 ? 7 : 0));
    rango(sab, sumarDias(sab, 1), "el fin de semana del " + corta(sab)); quitar(m[0]);
  }

  // Meses: «este mes», «el mes que viene», «en noviembre», «en noviembre del año pasado»
  if ((m = /\beste mes\b/.exec(n))) { rango(inicioMes(hoy), finMes(hoy), "este mes"); quitar(m[0]); }
  else if ((m = /\b(el mes que viene|el proximo mes)\b/.exec(n))) { const i = sumarMeses(inicioMes(hoy), 1); rango(i, finMes(i), MESES[Number(i.slice(5, 7)) - 1]); quitar(m[0]); }
  else if ((m = /\bel mes pasado\b/.exec(n))) { const i = sumarMeses(inicioMes(hoy), -1); rango(i, finMes(i), MESES[Number(i.slice(5, 7)) - 1]); quitar(m[0]); }

  // Fecha con mes: «el 3 de noviembre» (sin año: la más cercana en el sentido de la pregunta)
  if ((m = new RegExp(`\\b(?:el )?(\\d{1,2}) de (${MES_N.join("|")})(?: de (\\d{4}))?\\b`).exec(n))) {
    const d = Number(m[1]), mes = MES_N.indexOf(m[2]) + 1;
    let anio = m[3] ? Number(m[3]) : Number(hoy.slice(0, 4));
    let iso = `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (!m[3] && intencion !== "ultima" && iso < sumarDias(hoy, -31)) iso = `${anio + 1}${iso.slice(4)}`;
    if (existe(Number(iso.slice(0, 4)), mes, d)) dia(iso);
    quitar(m[0]);
  } else if ((m = new RegExp(`\\ben (${MES_N.join("|")})\\b`).exec(n))) {
    const mes = MES_N.indexOf(m[1]) + 1;
    let anio = Number(hoy.slice(0, 4));
    const pasado = intencion === "ultima" || /\bpasad[oa]\b/.test(n);
    if (!pasado && mes < Number(hoy.slice(5, 7))) anio++;
    if (pasado && mes > Number(hoy.slice(5, 7))) anio--;
    const i = `${anio}-${String(mes).padStart(2, "0")}-01`;
    rango(i, finMes(i), MESES[mes - 1]); quitar(m[0]);
  }

  // Día de la semana: «el viernes» (el próximo, o hoy), «el viernes pasado», «el martes que viene»
  if ((m = new RegExp(`\\b(?:el |este |esta )?(proximo )?(${DSEM.join("|")})( pasado| que viene| proximo| de la semana que viene)?\\b`).exec(n)) && !desde) {
    const dow = DSEM.indexOf(m[2]);
    let iso;
    if (/pasado/.test(m[3] ?? "") || intencion === "ultima") iso = sumarDias(hoy, -(((diaSemana(hoy) - dow + 7) % 7) || 7));
    else if (/semana que viene/.test(m[3] ?? "")) iso = sumarDias(sumarDias(lunes, 7), dow);
    else { let k = (dow - diaSemana(hoy) + 7) % 7; if (k === 0 && (m[1] || m[3])) k = 7; iso = sumarDias(hoy, k); }
    dia(iso); quitar(m[0]);
  } else if (m) quitar(m[0]);

  // Franja del día
  let franja = null;
  if ((m = /\b(por la |de la |esta )(manana|tarde|noche)\b/.exec(n))) {
    franja = m[2] === "manana" ? [0, 14 * 60] : m[2] === "tarde" ? [14 * 60, 21 * 60] : [19 * 60, 24 * 60];
    quitar(m[0]);
  }

  // Solo una intención de agenda sin fecha: «¿qué tengo?» → hoy
  if (intencion === "agenda" && !desde) dia(hoy, "hoy, " + larga(hoy));
  if (intencion === "contar" && !desde) rango(sumarDias(hoy, -30), hoy, "los últimos 30 días");

  quitar(/\b(como se llaman?|donde esta|donde estan|que es|que son|me puedes decir|sabes)\b/g);
  quitar(/\b(que tengo|que hay|que hago|tengo algo|tengo planes|estoy libre|agenda|cuando|que|tengo|hay|planes?|para|el|la|los|las|de|del|en|a|me|mi|mis|toca|es|son|fue|sera)\b/g);
  return { desde, hasta, etiqueta, intencion, franja, resto: n.replace(/\s+/g, " ").trim() };
}
