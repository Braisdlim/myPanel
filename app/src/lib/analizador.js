// Analizador determinista de frases en español para «Apuntar» (D-002): sin IA.
// Entiende días relativos, días de la semana, fechas, horas, rangos y duraciones.
// Cuando algo es ambiguo (qué viernes, mañana o noche, fecha imposible) no adivina: devuelve una duda con opciones.
import { sumarDias, sumarMeses, diaSemana, existe, desdeISO, DIAS, MESES, corta, hora as fHora, rango as fRango } from "./fechas.js";

const NUM = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, quince: 15, veinte: 20, treinta: 30 };
const PAL_NUM = Object.keys(NUM).sort((a, b) => b.length - a.length).join("|");
const DSEM = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const MES_N = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const HORA = `(\\d{1,2})(?:[:.h](\\d{2}))?|(${PAL_NUM})`;
const FRACCION = "( y media| y cuarto| menos cuarto)?";
const FRANJA = "(?: (de la manana|de la tarde|de la noche|de la madrugada|por la manana|por la tarde|por la noche|del mediodia))?";
const ORDENES = /^(?:recuerdame|recordarme|apuntame|apunta|anota|anotame|pon(?:me)?|anade|crea(?: un evento| una tarea)?|tengo que|hay que|quiero)\s+/;

// Minúsculas y sin tildes, con la misma longitud que el original para poder resaltar.
const normal = (t) => [...t].map((c) => c.normalize("NFD")[0].toLowerCase()).join("");
const numero = (s) => (s === undefined ? undefined : /^\d+$/.test(s) ? Number(s) : NUM[s]);

function proximo(hoy, dow, estricto) {
  let n = (dow - diaSemana(hoy) + 7) % 7;
  if (n === 0 && estricto) n = 7;
  return sumarDias(hoy, n);
}

function horaDe(m, i, fraccion) {
  let h = m[i] !== undefined ? Number(m[i]) : numero(m[i + 2]);
  let min = m[i + 1] !== undefined ? Number(m[i + 1]) : 0;
  if (fraccion === " y media") min = 30;
  if (fraccion === " y cuarto") min = 15;
  if (fraccion === " menos cuarto") { h -= 1; min = 45; }
  const veinticuatro = m[i] !== undefined && (m[i].length === 2 && m[i][0] === "0");
  return { h, min, veinticuatro };
}

function aplicarFranja(h, franja) {
  if (!franja) return null;
  if (/manana|madrugada/.test(franja)) return h === 12 ? 0 : h;
  if (/mediodia/.test(franja)) return h < 12 ? h + 12 : h;
  return h < 12 ? h + 12 : h; // tarde o noche
}

export function analizar(texto, hoy) {
  const n = normal(texto);
  const usados = [];
  const marcas = [];
  const dudas = [];
  let fecha = null, inicio = null, fin = null, todoElDia = false, durMin = null;
  let horaAmbigua = null;
  const marcar = (m, idx = m.index, len = m[0].length, resaltar = true) => {
    usados.push([idx, idx + len]);
    if (resaltar) marcas.push([idx, idx + len]);
  };
  const libre = (idx, len) => !usados.some(([a, b]) => idx < b && idx + len > a);
  const buscar = (re) => { re.lastIndex = 0; let m; while ((m = re.exec(n))) { if (libre(m.index, m[0].length)) return m; } return null; };

  // Franja suelta («por la tarde», «esta noche») que desambigua la hora
  let franjaGlobal = null;
  let m = buscar(/\b(?:por la|esta) (manana|tarde|noche)\b/g);
  if (m) {
    franjaGlobal = m[1] === "manana" ? "de la manana" : "de la " + m[1];
    if (m[0].startsWith("esta")) fecha = hoy;
  }
  const mFranja = m; // se marca después de leer la hora, que puede incluirla

  if ((m = buscar(/\btodo el dia\b/g))) { todoElDia = true; marcar(m); }

  // Días relativos
  if ((m = buscar(/\bpasado manana\b/g))) { fecha = sumarDias(hoy, 2); marcar(m); }
  else if ((m = buscar(/(?<!de la |por la )\bmanana\b/g))) { fecha = sumarDias(hoy, 1); marcar(m); }
  if ((m = buscar(/\bhoy\b/g))) { fecha = hoy; marcar(m); }
  if ((m = buscar(new RegExp(`\\b(?:dentro de|en) (\\d+|${PAL_NUM}) (dias?|semanas?|mes(?:es)?)\\b`, "g")))) {
    const k = numero(m[1]);
    fecha = m[2].startsWith("dia") ? sumarDias(hoy, k) : m[2].startsWith("semana") ? sumarDias(hoy, 7 * k) : sumarMeses(hoy, k);
    marcar(m);
  }

  // Fecha con mes: «el 3 de noviembre», «14 de diciembre de 2027»
  if ((m = buscar(new RegExp(`\\b(?:el )?(\\d{1,2}) de (${MES_N.join("|")})(?: de (\\d{4}))?\\b`, "g")))) {
    const dia = Number(m[1]), mes = MES_N.indexOf(m[2]) + 1;
    let anio = m[3] ? Number(m[3]) : Number(hoy.slice(0, 4));
    marcar(m);
    if (!existe(anio, mes, dia)) {
      dudas.push({ tipo: "fecha", texto: `El ${dia} de ${MESES[mes - 1]} no existe. ¿Qué día es?`, opciones: [] });
    } else {
      let iso = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      if (!m[3] && iso < hoy) iso = `${anio + 1}${iso.slice(4)}`;
      fecha = iso;
    }
  }

  // Día de la semana, con «que viene», «próximo», «la semana que viene» y número opcional («el jueves 28»)
  const reDia = new RegExp(`\\b(?:(?:el|este|esta) )?(proximo )?(${DSEM.join("|")})( que viene| proximo| de la semana que viene)?(?: (\\d{1,2})\\b(?! de))?`, "g");
  if ((m = buscar(reDia))) {
    const dow = DSEM.indexOf(m[2]);
    const semanaQueViene = !!m[3]?.includes("semana") || /\b(?:la semana que viene|la proxima semana)\b/.test(n);
    const proximoExpl = !!m[1] || / que viene| proximo/.test(m[3] ?? "");
    const este = /^(?:este|esta) /.test(m[0]);
    marcar(m);
    const sq = buscar(/\b(?:la semana que viene|la proxima semana)\b/g);
    if (sq) marcar(sq);
    let iso;
    if (fecha && !m[4]) {
      // Ya hay una fecha con mes («el lunes 2 de noviembre»): solo se comprueba que cuadre
      if (diaSemana(fecha) !== dow) {
        dudas.push({ tipo: "dia", texto: `El ${corta(fecha)} no es ${DIAS[dow]}. ¿Qué día es?`,
          opciones: [{ etiqueta: corta(fecha), fecha }, { etiqueta: corta(proximo(hoy, dow, proximoExpl)), fecha: proximo(hoy, dow, proximoExpl) }] });
        fecha = null;
      }
    } else if (semanaQueViene) iso = sumarDias(sumarDias(hoy, 7 - diaSemana(hoy)), dow);
    else iso = proximo(hoy, dow, proximoExpl);
    if (iso === undefined) {
      // nada más que hacer
    } else if (m[4]) {
      const diaMes = Number(m[4]);
      let cand = hoy.slice(0, 8) + String(diaMes).padStart(2, "0");
      if (cand < hoy) cand = sumarMeses(hoy.slice(0, 8) + "01", 1).slice(0, 8) + String(diaMes).padStart(2, "0");
      const [a, me] = cand.split("-").map(Number);
      if (!existe(a, me, diaMes)) dudas.push({ tipo: "fecha", texto: `El ${diaMes} no existe ese mes. ¿Qué día es?`, opciones: [] });
      else if (diaSemana(cand) !== dow) {
        dudas.push({ tipo: "dia", texto: `El ${diaMes} es ${DIAS[diaSemana(cand)]}, no ${DIAS[dow]}. ¿Cuál quieres?`,
          opciones: [{ etiqueta: corta(cand), fecha: cand }, { etiqueta: corta(iso), fecha: iso }] });
      } else iso = cand;
      if (!dudas.length) fecha = iso;
    } else if (diaSemana(hoy) === dow && !proximoExpl && !semanaQueViene && !este) {
      dudas.push({ tipo: "dia", texto: `Hoy también es ${DIAS[dow]}. ¿Cuál?`,
        opciones: [{ etiqueta: `hoy, ${corta(hoy)}`, fecha: hoy }, { etiqueta: corta(sumarDias(hoy, 7)), fecha: sumarDias(hoy, 7) }] });
    } else fecha = iso;
  }

  // «el 28» suelto: día del mes
  if (!fecha && !dudas.some((d) => d.tipo !== "hora") && (m = buscar(/\bel (\d{1,2})\b(?! de)(?!:)/g))) {
    const d = Number(m[1]);
    let cand = hoy.slice(0, 8) + String(d).padStart(2, "0");
    if (cand < hoy) cand = sumarMeses(hoy.slice(0, 8) + "01", 1).slice(0, 8) + String(d).padStart(2, "0");
    const [a, me] = cand.split("-").map(Number);
    if (existe(a, me, d)) { fecha = cand; marcar(m); }
  }

  // Horas: rango («de 9 a 11»), hora suelta («a las 17:30», «a las nueve y media de la noche»), mediodía
  const reRango = new RegExp(`\\b(?:de|desde las?) (?:${HORA})${FRACCION}${FRANJA} (?:a|hasta) (?:las? )?(?:${HORA})${FRACCION}${FRANJA}`, "g");
  const reHora = new RegExp(`\\b(?:a las?|sobre las?|para las?|hacia las?) (?:${HORA})${FRACCION}${FRANJA}|\\b(\\d{1,2})(?::(\\d{2}))?h\\b`, "g");
  if ((m = buscar(reRango))) {
    const a = horaDe(m, 1, m[4]), b = horaDe(m, 6, m[9]);
    const franja = m[10] ?? m[5] ?? franjaGlobal;
    marcar(m);
    let ha = aplicarFranja(a.h, franja), hb = aplicarFranja(b.h, franja);
    if (ha === null) {
      const ambigua = !a.veinticuatro && a.h >= 1 && a.h <= 11 && b.h <= 12;
      if (ambigua) horaAmbigua = { a: a.h * 60 + a.min, b: b.h * 60 + b.min };
      ha = a.h; hb = b.h < a.h ? b.h + 12 : b.h;
    }
    inicio = ha * 60 + a.min; fin = hb * 60 + b.min;
  } else if ((m = buscar(reHora))) {
    marcar(m);
    if (m[6] !== undefined) {
      const h = Number(m[6]);
      inicio = h * 60 + (m[7] ? Number(m[7]) : 0);
      if (h >= 1 && h <= 11 && !franjaGlobal) horaAmbigua = { a: inicio };
    } else {
      const a = horaDe(m, 1, m[4]);
      const franja = m[5] ?? franjaGlobal;
      const h = aplicarFranja(a.h, franja);
      if (h === null) {
        inicio = a.h * 60 + a.min;
        if (!a.veinticuatro && a.h >= 1 && a.h <= 11) horaAmbigua = { a: inicio };
      } else inicio = h * 60 + a.min;
    }
  } else if ((m = buscar(/\b(?:a|al) mediodia\b/g))) { inicio = 12 * 60; marcar(m); }

  if (mFranja && libre(mFranja.index, mFranja[0].length)) marcar(mFranja);

  // Duración
  if ((m = buscar(new RegExp(`\\b(?:(\\d+|${PAL_NUM}) horas?(?: y media)?|media hora|hora y media|(\\d+) ?min(?:utos)?)\\b`, "g")))) {
    if (m[0] === "media hora") durMin = 30;
    else if (m[0] === "hora y media") durMin = 90;
    else if (m[2]) durMin = Number(m[2]);
    else durMin = numero(m[1]) * 60 + (m[0].includes("y media") ? 30 : 0);
    marcar(m);
  }
  if (inicio !== null && fin === null) fin = inicio + (durMin ?? 60);

  if (horaAmbigua) {
    const { a, b } = horaAmbigua;
    const dur = b !== undefined ? fin - inicio : fin - inicio;
    const op = (x) => ({ etiqueta: b !== undefined ? fRango(x, x + dur) : fHora(x), inicio: x, fin: x + dur });
    dudas.push({ tipo: "hora", texto: `¿${fHora(a)} de la mañana o ${fHora(a + 720)} de la tarde o la noche?`, opciones: [op(a), op(a + 720)] });
  }

  // Título: lo que queda sin las partes de fecha y hora
  let titulo = "";
  for (let i = 0; i < texto.length; i++) titulo += usados.some(([a, b]) => i >= a && i < b) ? " " : texto[i];
  titulo = titulo.replace(/\s+/g, " ").trim();
  const tn = normal(titulo);
  const orden = tn.match(ORDENES);
  if (orden) titulo = titulo.slice(orden[0].length);
  titulo = titulo.replace(/^(?:el|la|los|las|a|de|para|un|una)\s+(?=\S)/i, (x) => (/^(un|una)\s/i.test(x) ? x : ""))
    .replace(/(?:[\s,;]+(?:el|la|a|de|y|para|que|con|en|del))+[\s,;]*$/i, "")
    .replace(/[\s,;.]+$/, "").trim();
  if (titulo) titulo = titulo[0].toUpperCase() + titulo.slice(1);

  const tieneHora = inicio !== null || todoElDia || dudas.some((d) => d.tipo === "hora");
  marcas.sort((a, b) => a[0] - b[0]);
  return { titulo, fecha, inicio, fin, todoElDia, duracionMin: durMin, dudas, marcas, tipo: tieneHora ? "evento" : "tarea" };
}

/** Aplica la opción elegida para una duda y devuelve el resultado actualizado. */
export function resolver(r, indice, opcion) {
  const dudas = r.dudas.filter((_, i) => i !== indice);
  const out = { ...r, dudas };
  if (opcion.fecha) out.fecha = opcion.fecha;
  if (opcion.inicio !== undefined) { out.inicio = opcion.inicio; out.fin = opcion.fin; }
  return out;
}

export { desdeISO };
