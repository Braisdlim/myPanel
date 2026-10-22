// Horario de trabajo (D-054): un bloque fijo los días laborables, salvo los días libres que ya marcas en tus
// calendarios con un evento de todo el día («Vacaciones», «Festivo (No trabajo)»…). Solo vive en Pauta: no se
// escribe en Google. Funciones puras (se prueban con node).
import { diaSemana } from "./fechas.js";

export const HORARIO_INICIAL = {
  activo: false,
  dias: [0, 1, 2, 3, 4], // 0 = lunes … 6 = domingo
  inicio: 8 * 60,
  fin: 17 * 60 + 30,
  palabras: "vacaciones, festivo, no trabajo, día libre",
};

const normal = (t) => (t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Las palabras de la configuración, ya normalizadas («día libre» → «dia libre»). */
export const listaPalabras = (texto) => normal(texto).split(",").map((p) => p.trim()).filter(Boolean);

/** ¿El título de un evento de todo el día marca un día libre? Palabra o frase completa, sin tildes ni mayúsculas. */
export function marcaLibre(titulo, palabras) {
  const t = ` ${normal(titulo).replace(/[^a-z0-9ñ]+/g, " ")} `;
  return palabras.some((p) => t.includes(` ${p.replace(/[^a-z0-9ñ]+/g, " ").trim()} `));
}

/**
 * El evento de todo el día que hace libre este día, o null. Solo cuentan los de calendarios tuyos: los festivos
 * de Google mezclan días que no son fiesta (Nochebuena, San Valentín, Reconquista…) y los compartidos no son tuyos.
 * @param propio (calendarioId) → ¿es un calendario tuyo?
 */
export function motivoLibre(eventosDia, cfg, propio) {
  const palabras = listaPalabras(cfg.palabras);
  return eventosDia.find((e) => e.todoElDia && !e.trabajo && [e.calendarioId, ...(e.fuentes ?? []).map((f) => f.calendarioId)].some((id) => id && propio(id)) && marcaLibre(e.titulo, palabras)) ?? null;
}

/** El bloque de trabajo de un día, o null si no trabajas ese día (no es laborable o lo tienes marcado libre). */
export function bloqueTrabajo(dia, cfg, eventosDia, propio) {
  if (!cfg?.activo || !cfg.dias.includes(diaSemana(dia)) || cfg.fin <= cfg.inicio) return null;
  if (motivoLibre(eventosDia, cfg, propio)) return null;
  return { id: `trabajo|${dia}`, dia, titulo: "Trabajo", inicio: cfg.inicio, fin: cfg.fin, todoElDia: false, trabajo: true, cuenta: null, ejemplo: false, opcional: false };
}

/** Días laborables que vas a librar entre dos fechas, con su motivo (para comprobarlo en Ajustes). */
export function proximosLibres(desde, hasta, cfg, eventosDe, propio, sumarDias) {
  const out = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) {
    if (!cfg.dias.includes(diaSemana(d))) continue;
    const m = motivoLibre(eventosDe(d), cfg, propio);
    if (m) out.push({ dia: d, motivo: m.titulo, calendario: m.calendario });
  }
  return out;
}
