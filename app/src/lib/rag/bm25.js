// BM25 (Robertson y Zaragoza, 2009) sobre los fragmentos: la búsqueda por palabras, sin IA (D-061).
import { terminos } from "./texto.js";

/**
 * @param docs [{ id, texto }] (el texto ya lleva la cabecera del fragmento)
 * @returns { buscar(consulta, { ids, k }) → [{ id, puntos }] } de mayor a menor
 */
export function crearBM25(docs, { k1 = 1.2, b = 0.75 } = {}) {
  const largo = new Map(), tf = new Map(), df = new Map();
  for (const d of docs) {
    const ts = terminos(d.texto);
    largo.set(d.id, ts.length);
    const f = new Map();
    for (const t of ts) f.set(t, (f.get(t) ?? 0) + 1);
    tf.set(d.id, f);
    for (const t of f.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const N = docs.length || 1;
  const media = [...largo.values()].reduce((s, x) => s + x, 0) / N || 1;
  const idf = (t) => Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));

  return {
    /** `ids`: si viene, solo puntúa esos fragmentos (filtro de fechas o de tipo antes de buscar). */
    buscar(consulta, { ids = null, k = 50 } = {}) {
      const q = [...new Set(terminos(consulta))];
      if (!q.length) return [];
      const out = [];
      for (const [id, f] of tf) {
        if (ids && !ids.has(id)) continue;
        let s = 0;
        for (const t of q) {
          const n = f.get(t);
          if (n) s += idf(t) * (n * (k1 + 1)) / (n + k1 * (1 - b + (b * largo.get(id)) / media));
        }
        if (s > 0) out.push({ id, puntos: s });
      }
      return out.sort((a, c) => c.puntos - a.puntos).slice(0, k);
    },
    terminosDe: (consulta) => [...new Set(terminos(consulta))],
  };
}
