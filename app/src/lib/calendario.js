// Une los eventos guardados de todas las cuentas reales en un índice por día (funciones puras, se prueban con node).

// Palabras que no cuentan al comparar títulos
const VACIAS = new Set(["de", "del", "la", "el", "los", "las", "y", "e", "en", "a", "al", "con", "para", "por", "un", "una", "the", "of", "and"]);

/** Palabras con significado de un título: minúsculas, sin tildes ni signos. */
export function palabras(titulo) {
  return new Set((titulo ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .split(/[^a-z0-9ñ]+/).filter((p) => p.length > 1 && !VACIAS.has(p)));
}

/**
 * ¿Dos títulos hablan de lo mismo? Sí si casi todas las palabras del más corto están en el otro
 * («Ensayo General» y «Ensayo General | Banda de Música de Noia»). Sin palabras, solo si los dos están vacíos.
 */
export function mismoTitulo(a, b) {
  const A = palabras(a), B = palabras(b);
  if (!A.size || !B.size) return A.size === B.size;
  const [menor, mayor] = A.size <= B.size ? [A, B] : [B, A];
  let comunes = 0;
  for (const p of menor) if (mayor.has(p)) comunes++;
  return comunes / menor.size >= 0.75;
}

/**
 * ¿Es el mismo plan visto desde otro calendario? Mismo día, mismo tipo (con hora o todo el día),
 * la misma hora de inicio y un título equivalente. La hora de fin puede variar: se avisa en `fines`.
 */
export const mismoPlan = (a, b) => a.dia === b.dia && a.todoElDia === b.todoElDia && (a.todoElDia || a.inicio === b.inicio) && mismoTitulo(a.titulo, b.titulo);

/**
 * @param eventosPorCuenta id de cuenta → eventos convertidos (google.js)
 * @param cuentas en orden de conexión; manda la primera cuando un evento está en dos cuentas
 * @returns Map día → eventos, sin los de calendarios apagados y sin repetidos. Cada evento lleva
 *   `fuentes` (dónde más está: cuenta, calendario, fin y título), `tambien` (otras cuentas) y `unidoPor`
 *   («uid» si Google dice que es el mismo; «parecido» si lo deduce Pauta por título y hora).
 */
export function indexar(eventosPorCuenta, cuentas) {
  const porDia = new Map();
  const vistos = new Map(); // uid|día|inicio → evento ya puesto
  const propio = new Map(); // id de calendario → ¿es tuyo? (se prefiere como evento principal)
  for (const c of cuentas) for (const x of c.calendarios) propio.set(x.id, x.rol === "owner" || !!x.principal);

  const juntar = (previo, e, como) => {
    if (previo.cuenta !== e.cuenta && !previo.tambien.includes(e.cuenta)) previo.tambien.push(e.cuenta);
    previo.fuentes.push({ cuenta: e.cuenta, calendario: e.calendario, calendarioId: e.calendarioId, fin: e.fin, titulo: e.titulo, enlace: e.enlace });
    if (previo.unidoPor !== "parecido") previo.unidoPor = como;
    // Si el que llega es de un calendario tuyo y el puesto no, el tuyo pasa a ser el principal (es el que podrás cambiar)
    if (como === "parecido" && propio.get(e.calendarioId) && !propio.get(previo.calendarioId)) {
      const fuentes = previo.fuentes.map((f) => (f.calendarioId === e.calendarioId && f.titulo === e.titulo ? { cuenta: previo.cuenta, calendario: previo.calendario, calendarioId: previo.calendarioId, fin: previo.fin, titulo: previo.titulo, enlace: previo.enlace } : f));
      Object.assign(previo, { ...e, fuentes, tambien: previo.tambien, unidoPor: previo.unidoPor });
    }
  };

  for (const c of cuentas) {
    const activos = new Set(c.calendarios.filter((x) => x.activo).map((x) => x.id));
    for (const e of eventosPorCuenta[c.id] ?? []) {
      if (e.calendarioId && !activos.has(e.calendarioId)) continue;
      const clave = `${e.uid}|${e.dia}|${e.inicio}`;
      const previo = vistos.get(clave);
      // El mismo evento en otra cuenta o calendario (una invitación entre tus cuentas): se muestra una vez
      if (previo) { juntar(previo, e, "uid"); continue; }
      // Otro evento con el mismo plan (p. ej., el ensayo copiado en varios calendarios compartidos)
      const parecido = (porDia.get(e.dia) ?? []).find((x) => mismoPlan(x, e));
      if (parecido) { juntar(parecido, e, "parecido"); vistos.set(clave, parecido); continue; }
      const copia = { ...e, tambien: [], fuentes: [], unidoPor: null };
      vistos.set(clave, copia);
      if (!porDia.has(e.dia)) porDia.set(e.dia, []);
      porDia.get(e.dia).push(copia);
    }
  }
  for (const evs of porDia.values()) evs.sort(ordenar);
  return porDia;
}

/** Horas de fin distintas entre las copias de un evento unido (para avisar: «otro calendario dice hasta las 0:00»). */
export const finesDistintos = (e) => [...new Set((e.fuentes ?? []).map((f) => f.fin).filter((f) => f !== e.fin))];

export const ordenar = (a, b) => b.todoElDia - a.todoElDia || a.inicio - b.inicio || a.fin - b.fin;
