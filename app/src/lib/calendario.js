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
 * («Ensayo General» y «Ensayo General | Banda de Música»). Sin palabras, solo si los dos están vacíos.
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
  const grupos = new Map(); // día → [{ copias, unidoPor }]
  const vistos = new Map(); // uid|día|inicio → grupo
  const propio = new Map(); // id de calendario → ¿es tuyo?
  for (const c of cuentas) for (const x of c.calendarios) propio.set(x.id, x.rol === "owner" || !!x.principal);

  for (const c of cuentas) {
    const activos = new Set(c.calendarios.filter((x) => x.activo).map((x) => x.id));
    for (const e of eventosPorCuenta[c.id] ?? []) {
      if (e.calendarioId && !activos.has(e.calendarioId)) continue;
      const clave = `${e.uid}|${e.dia}|${e.inicio}`;
      // El mismo evento en otra cuenta o calendario (una invitación entre tus cuentas)
      let g = vistos.get(clave);
      if (g) { g.copias.push(e); g.unidoPor ??= "uid"; continue; }
      // Otro evento con el mismo plan (p. ej., el ensayo copiado en varios calendarios compartidos)
      g = (grupos.get(e.dia) ?? []).find((x) => x.copias.some((y) => mismoPlan(y, e)));
      if (g) { g.copias.push(e); g.unidoPor = "parecido"; vistos.set(clave, g); continue; }
      g = { copias: [e], unidoPor: null };
      vistos.set(clave, g);
      if (!grupos.has(e.dia)) grupos.set(e.dia, []);
      grupos.get(e.dia).push(g);
    }
  }

  const porDia = new Map();
  for (const [dia, gs] of grupos) porDia.set(dia, gs.map((g) => principal(g, propio)).sort(ordenar));
  return porDia;
}

/**
 * El evento que se muestra de un grupo de copias: primero el de un calendario tuyo (es el que podrás cambiar);
 * si no, el de la hora de fin en la que coinciden más copias y, entre copias parecidas, el título más completo.
 * A igualdad, el primero (manda la primera cuenta conectada).
 */
function principal({ copias, unidoPor }, propio) {
  const votos = new Map();
  for (const e of copias) votos.set(e.fin, (votos.get(e.fin) ?? 0) + 1);
  const nota = (e) => [propio.get(e.calendarioId) ? 1 : 0, votos.get(e.fin), unidoPor === "parecido" ? palabras(e.titulo).size : 0];
  let elegido = copias[0];
  for (const e of copias.slice(1)) {
    const [a, b] = [nota(e), nota(elegido)];
    const i = a.findIndex((x, k) => x !== b[k]);
    if (i !== -1 && a[i] > b[i]) elegido = e;
  }
  const otras = copias.filter((e) => e !== elegido);
  return {
    ...elegido, unidoPor,
    tambien: [...new Set(otras.map((e) => e.cuenta).filter((x) => x !== elegido.cuenta))],
    fuentes: otras.map((e) => ({ cuenta: e.cuenta, calendario: e.calendario, calendarioId: e.calendarioId, fin: e.fin, titulo: e.titulo, enlace: e.enlace, uid: e.uid })),
  };
}

/** Horas de fin distintas entre las copias de un evento unido (para avisar: «otro calendario dice hasta las 0:00»). */
export const finesDistintos = (e) => [...new Set((e.fuentes ?? []).map((f) => f.fin).filter((f) => f !== e.fin))];

// ---------- cambiar una vez (paso 3 bis) ----------

/** ¿Ocupa tiempo en la agenda? Los opcionales y los que marcas «No voy esta vez» no cuentan (ni para huecos ni para solapes). */
export const bloquea = (e) => !e.todoElDia && !e.opcional && !e.noVoy;

/** Clave de «No voy esta vez»: una ocurrencia concreta (su uid, día y hora), no la serie. */
export const claveOcurrencia = (e, uid = e.uid) => `${uid}|${e.dia}|${e.inicio}`;
/** Todas las claves con las que puede estar guardado (el evento unido y sus copias en otros calendarios). */
export const clavesDe = (e) => [claveOcurrencia(e), ...(e.fuentes ?? []).filter((f) => f.uid).map((f) => claveOcurrencia(e, f.uid))];

/**
 * Hasta `max` huecos libres de la misma duración para «Mover esta vez», como en la maqueta (AndroidOcurrencia):
 * primero a la misma hora en los días cercanos (de 3 días antes a 4 después), luego otras horas del mismo día.
 * @param eventosDe (día) → eventos de ese día (todas las cuentas)
 */
export function proponerHuecos(ev, eventosDe, hoy, ahora, { desde = 8 * 60, hasta = 23 * 60 + 30, max = 3 } = {}) {
  const dur = ev.fin - ev.inicio;
  const ids = new Set([ev.id]);
  const libre = (dia, ini) => {
    if (ini < desde || ini + dur > hasta) return false;
    if (dia < hoy || (dia === hoy && ini <= ahora)) return false;
    if (dia === ev.dia && ini === ev.inicio) return false;
    return !eventosDe(dia).some((x) => !ids.has(x.id) && bloquea(x) && x.inicio < ini + dur && ini < x.fin);
  };
  const out = [];
  const poner = (dia, ini) => { if (out.length < max && !out.some((h) => h.dia === dia && h.inicio === ini) && libre(dia, ini)) out.push({ dia, inicio: ini, fin: ini + dur }); };
  // Misma hora, otro día: el más cercano primero (después antes que antes)
  for (const n of [1, -1, 2, -2, 3, -3, 4]) poner(sumarDiasISO(ev.dia, n), ev.inicio);
  // Otras horas del mismo día, las más cercanas primero
  for (let k = 1; k <= 30 && out.length < max; k++) { poner(ev.dia, ev.inicio + 30 * k); poner(ev.dia, ev.inicio - 30 * k); }
  return out.sort((a, b) => a.dia.localeCompare(b.dia) || a.inicio - b.inicio);
}

/** Eventos que pisaría un evento puesto en ese día y horas (para avisar con «Otra hora…»). */
export const pisaria = (ev, dia, inicio, fin, eventosDe) => eventosDe(dia).filter((x) => x.id !== ev.id && bloquea(x) && x.inicio < fin && inicio < x.fin);

function sumarDiasISO(iso, n) {
  const [a, m, d] = iso.split("-").map(Number);
  const x = new Date(a, m - 1, d + n, 12);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export const ordenar = (a, b) => b.todoElDia - a.todoElDia || a.inicio - b.inicio || a.fin - b.fin;
