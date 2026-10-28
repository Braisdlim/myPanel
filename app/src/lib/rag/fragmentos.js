// Fragmentos que indexa el asistente (D-061). Cada uno lleva una cabecera fija hecha con sus metadatos
// («Evento · mar 27 oct 2026 · 10:30–11:30 · Gmail 1»): el «contexto» de Anthropic (Contextual Retrieval, 2024)
// sin llamar a ningún modelo. Eventos, tareas y datos de «Lo que sé de ti» son un fragmento cada uno; las notas
// largas se trocean por párrafos (máx. ~120 palabras, con la última frase repetida en el siguiente trozo).
import { cortaConAnio, rango } from "../fechas.js";

const MAX_PALABRAS = 120;

/**
 * @param {{ eventos?: any[], tareas?: any[], memoria?: any[], notas?: any[] }} fuentes
 * @param {{ hoy: string, cuenta?: (id) => { nombre: string } }} opciones
 */
export function crearFragmentos({ eventos = [], tareas = [], memoria = [], notas = [] }, { hoy, cuenta = () => null } = {}) {
  const out = [];
  for (const e of eventos) {
    if (e.trabajo) continue;
    const quien = e.cuenta ? cuenta(e.cuenta)?.nombre : null;
    const cuando = `${cortaConAnio(e.dia, hoy)} · ${e.todoElDia ? "todo el día" : rango(e.inicio, e.fin)}`;
    out.push({
      id: `evento:${e.id}`, tipo: "evento", ref: { tipo: "evento", dia: e.dia, id: e.id },
      titulo: e.titulo, fecha: e.dia, inicio: e.todoElDia ? null : e.inicio, fin: e.todoElDia ? null : e.fin,
      cabecera: ["Evento", cuando, quien, e.calendario && e.calendario !== cuenta(e.cuenta)?.correo ? e.calendario : null].filter(Boolean).join(" · "),
      texto: [e.titulo, e.lugar ? `Lugar: ${e.lugar}` : "", e.nota ?? "", e.opcional ? "Opcional." : ""].filter(Boolean).join(". "),
      fuente: quien ?? "Pauta", ejemplo: !!e.ejemplo, confianza: "dato",
    });
  }
  for (const t of tareas) {
    const fecha = t.cuando ?? t.limite ?? null;
    const partes = [t.hecha ? `hecha el ${cortaConAnio((t.hechaEn ?? "").slice(0, 10) || fecha || hoy, hoy)}` : "pendiente",
      t.cuando ? `para el ${cortaConAnio(t.cuando, hoy)}` : null, t.limite ? `fecha límite ${cortaConAnio(t.limite, hoy)}` : null];
    out.push({
      id: `tarea:${t.id}`, tipo: "tarea", ref: { tipo: "tarea", id: t.id },
      titulo: t.titulo, fecha, inicio: t.inicio ?? null, fin: t.inicio != null ? t.inicio + (t.duracionMin ?? 30) : null,
      cabecera: ["Tarea", ...partes].filter(Boolean).join(" · "),
      texto: [t.titulo, t.notas ?? "", ...(t.pasos ?? []).map((p) => p.texto ?? p)].filter(Boolean).join(". "),
      fuente: "Tareas de Pauta", confianza: "dato",
    });
  }
  for (const d of memoria) {
    out.push({
      id: `memoria:${d.id}`, tipo: "memoria", ref: { tipo: "memoria", id: d.id },
      titulo: d.texto.slice(0, 60), fecha: null,
      cabecera: `Lo que sé de ti · ${d.estado === "inferido" ? "inferido, sin confirmar" : "confirmado por ti"}${d.creado ? ` el ${cortaConAnio(d.creado.slice(0, 10), hoy)}` : ""}`,
      texto: d.texto, fuente: "Lo que sé de ti", confianza: d.estado === "inferido" ? "inferido" : "confirmado",
    });
  }
  for (const nota of notas) {
    const trozos = trocear(nota.texto);
    trozos.forEach((texto, i) => out.push({
      id: `nota:${nota.id}:${i}`, tipo: "nota", ref: { tipo: "nota", id: nota.id }, documento: nota.id,
      titulo: nota.titulo, fecha: nota.fecha ?? null,
      cabecera: [nota.subida ? "Documento subido" : "Nota", `«${nota.titulo}»`, trozos.length > 1 ? `parte ${i + 1} de ${trozos.length}` : null,
        nota.creado ? cortaConAnio(nota.creado.slice(0, 10), hoy) : null].filter(Boolean).join(" · "),
      texto, fuente: nota.subida ? "Documento subido (no verificado)" : "Notas", confianza: nota.subida ? "no-fiable" : "dato",
    }));
  }
  return out;
}

/** Trocea por párrafos; si uno es muy largo, por frases. La última frase de cada trozo se repite al empezar el siguiente. */
export function trocear(texto, max = MAX_PALABRAS) {
  const frases = (texto ?? "").split(/\n\s*\n/).flatMap((p) => p.trim() ? p.trim().split(/(?<=[.!?])\s+/) : []);
  const trozos = [];
  let actual = [];
  const palabras = (xs) => xs.join(" ").split(/\s+/).filter(Boolean).length;
  for (const f of frases) {
    if (actual.length && palabras([...actual, f]) > max) {
      trozos.push(actual.join(" "));
      actual = [actual.at(-1)];
    }
    actual.push(f);
  }
  if (actual.length && (!trozos.length || actual.join(" ") !== trozos.at(-1))) trozos.push(actual.join(" "));
  return trozos.length ? trozos : [""];
}

/** Texto que se indexa y se le enseña al modelo: cabecera + contenido. */
export const textoIndexable = (f) => `${f.cabecera}\n${f.texto}`;
