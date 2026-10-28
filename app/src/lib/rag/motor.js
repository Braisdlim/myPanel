// Motor del asistente (D-061): router temporal → filtro por fechas → BM25 ‖ vectores → RRF → resultado.
// Funciones puras: el mismo código corre en la app y en el banco de evaluación (scripts/evaluar-rag.mjs).
import { crearBM25 } from "./bm25.js";
import { leerTiempo } from "./tiempo.js";
import { terminos } from "./texto.js";
import { textoIndexable } from "./fragmentos.js";

export const RRF_K = 60; // Cormack et al., 2009
const POR_DOCUMENTO = 2; // como mucho 2 trozos de la misma nota
const K = 6;

/** Fusión por rangos recíprocos: suma 1/(k + puesto) de cada lista. */
export function rrf(listas, k = RRF_K) {
  const total = new Map();
  for (const lista of listas) lista.forEach((id, i) => total.set(id, (total.get(id) ?? 0) + 1 / (k + i + 1)));
  return [...total].sort((a, b) => b[1] - a[1]).map(([id, puntos]) => ({ id, puntos }));
}

export const coseno = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }; // vectores normalizados

/**
 * @param fragmentos de crearFragmentos()
 * @param {{ vectores?: Map<string, Float32Array>, embeber?: (texto) => Promise<Float32Array>, umbralVector?: number }} opciones
 */
export function crearMotor(fragmentos, { vectores = null, embeber = null, kVector = 20, usarCabecera = true, soloVectores = false } = {}) {
  const porId = new Map(fragmentos.map((f) => [f.id, f]));
  const bm25 = crearBM25(fragmentos.map((f) => ({ id: f.id, texto: usarCabecera ? textoIndexable(f) : f.texto + " " + (f.titulo ?? "") })));
  const conVectores = !!(vectores && embeber);

  /**
   * @returns {Promise<{ ruta, modo: "agenda"|"busqueda", resultados: Array<{ f, puntos, bm25?: number, vector?: number }>,
   *   abstener: boolean, conteo?: number, explicacion: string[] }>}
   */
  async function preguntar(pregunta, { hoy, ahora = 24 * 60, k = K, vectoresActivos = conVectores } = {}) {
    const ruta = leerTiempo(pregunta, hoy);
    const explicacion = [];
    const enRango = (f) => {
      if (!ruta.desde) return true;
      if (!f.fecha || f.fecha < ruta.desde || f.fecha > ruta.hasta) return false;
      if (ruta.franja && f.inicio != null) return f.inicio < ruta.franja[1] && (f.fin ?? f.inicio) > ruta.franja[0];
      return true;
    };
    const agenda = (f) => f.tipo === "evento" || (f.tipo === "tarea" && !/^Tarea · hecha/.test(f.cabecera));
    const ordenFecha = (a, b) => (a.f.fecha ?? "").localeCompare(b.f.fecha ?? "") || (a.f.inicio ?? -1) - (b.f.inicio ?? -1);
    if (ruta.desde) explicacion.push(`Fechas: ${ruta.etiqueta} (${ruta.desde === ruta.hasta ? ruta.desde : `${ruta.desde} → ${ruta.hasta}`})${ruta.franja ? ", solo esa franja" : ""}.`);

    // 1. «¿Qué tengo el martes?»: es una consulta a la agenda, no una búsqueda
    const contenido = terminos(ruta.resto);
    if (ruta.intencion === "agenda" && ruta.desde && !contenido.length) {
      const resultados = fragmentos.filter((f) => agenda(f) && enRango(f)).map((f) => ({ f, puntos: 1 })).sort(ordenFecha);
      explicacion.push(`Agenda: ${resultados.length} eventos y tareas en ese rango, ordenados por hora (sin búsqueda).`);
      return { ruta, modo: "agenda", resultados, abstener: false, explicacion };
    }

    // 2. Búsqueda híbrida dentro del rango (si lo hay)
    const candidatos = new Set(fragmentos.filter(enRango).map((f) => f.id));
    const consulta = contenido.length ? ruta.resto : pregunta;
    const lexico = bm25.buscar(consulta, { ids: ruta.desde ? candidatos : null, k: 50 });
    explicacion.push(`Palabras (BM25): ${lexico.length} fragmentos con «${bm25.terminosDe(consulta).join(" ")}».`);
    let semantico = [];
    if (vectoresActivos && conVectores) {
      const q = await embeber(pregunta);
      semantico = [...candidatos].filter((id) => vectores.has(id)).map((id) => ({ id, puntos: coseno(q, vectores.get(id)) }))
        .sort((a, b) => b.puntos - a.puntos).slice(0, 50);
      explicacion.push(`Significado (vectores): mejor parecido ${semantico[0]?.puntos.toFixed(3) ?? "—"}.`);
    }
    // Los puntos de e5 salen apiñados (0,80–0,90) y no separan «hay respuesta» de «no la hay» (medido en el banco):
    // entran los 20 más parecidos y la fusión por puestos decide; si las palabras no encuentran nada, la respuesta es dudosa.
    const utiles = semantico.slice(0, kVector);
    const listas = soloVectores ? [utiles.map((x) => x.id)] : [lexico.map((x) => x.id), ...(utiles.length ? [utiles.map((x) => x.id)] : [])];
    const fusion = soloVectores ? utiles : listas.length > 1 ? rrf(listas) : lexico.map((x) => ({ id: x.id, puntos: x.puntos }));
    const bmDe = new Map(lexico.map((x) => [x.id, x.puntos])), vDe = new Map(semantico.map((x) => [x.id, x.puntos]));

    // Diversidad: como mucho 2 trozos del mismo documento
    const usados = new Map();
    let resultados = [];
    for (const { id, puntos } of fusion) {
      const f = porId.get(id);
      const doc = f.documento ?? f.id;
      if ((usados.get(doc) ?? 0) >= POR_DOCUMENTO) continue;
      usados.set(doc, (usados.get(doc) ?? 0) + 1);
      resultados.push({ f, puntos, bm25: bmDe.get(id), vector: vDe.get(id) });
    }
    explicacion.push(`Fusión ${listas.length > 1 ? "RRF (k = 60) de palabras y significado" : "solo por palabras"}; máx. ${POR_DOCUMENTO} trozos por documento.`);

    // 3. Intenciones con fechas: la próxima, la última, cuántas veces
    if (ruta.intencion === "proxima" || ruta.intencion === "ultima") {
      // Los relevantes son los que tienen en el título más palabras de la pregunta («cumpleaños de Ana» antes que «regalo de Ana»)
      const q = new Set(contenido);
      const cubre = (r) => terminos(r.f.titulo ?? "").filter((t) => q.has(t)).length;
      const max = Math.max(0, ...resultados.slice(0, 10).map(cubre));
      const relevantes = max ? resultados.slice(0, 10).filter((r) => cubre(r) === max) : resultados.slice(0, 3);
      const enFecha = (r) => r.f.fecha && (ruta.intencion === "proxima" ? r.f.fecha > hoy || (r.f.fecha === hoy && (r.f.fin ?? 24 * 60) > ahora) : r.f.fecha < hoy || (r.f.fecha === hoy && (r.f.fin ?? 0) <= ahora));
      // Si lo más relevante no tiene fecha (una nota), se buscan fechas entre los 5 primeros
      let fechados = relevantes.filter(enFecha);
      if (!fechados.length) fechados = resultados.slice(0, 5).filter(enFecha);
      fechados.sort(ordenFecha);
      if (ruta.intencion === "ultima") fechados.reverse();
      if (fechados.length) {
        resultados = [...fechados, ...resultados.filter((r) => !fechados.includes(r))];
        explicacion.push(`${ruta.intencion === "proxima" ? "La próxima" : "La última"}: ordenado por fecha ${ruta.intencion === "proxima" ? "desde hoy" : "hacia atrás"}.`);
      }
    }
    let conteo;
    if (ruta.intencion === "contar") {
      const top = resultados[0]?.puntos ?? 0;
      const iguales = resultados.filter((r) => r.f.tipo === "evento" && r.puntos >= top * 0.8);
      const titulo = iguales[0]?.f.titulo;
      const contados = fragmentos.filter((f) => f.tipo === "evento" && enRango(f) && titulo && f.titulo === titulo);
      conteo = contados.length;
      resultados = [...contados.map((f) => ({ f, puntos: 1 })).sort(ordenFecha), ...resultados.filter((r) => r.f.titulo !== titulo)];
      explicacion.push(`Conteo hecho por el código: ${conteo} «${titulo ?? "—"}» en ${ruta.etiqueta}.`);
    }

    resultados = resultados.slice(0, Math.max(k, conteo ?? 0));
    const abstener = !resultados.length;
    const dudoso = !abstener && !lexico.length;
    if (abstener) explicacion.push("Nada encontrado: mejor decir «no lo sé» que inventar.");
    else if (dudoso) explicacion.push("Ninguna palabra coincide: solo hay parecidos de significado, así que la respuesta es dudosa.");
    return { ruta, modo: "busqueda", resultados, abstener, dudoso, conteo, explicacion };
  }

  return { preguntar, fragmentos, porId };
}
