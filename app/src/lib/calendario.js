// Une los eventos guardados de todas las cuentas reales en un índice por día (funciones puras, se prueban con node).

/**
 * @param eventosPorCuenta id de cuenta → eventos convertidos (google.js)
 * @param cuentas en orden de conexión; manda la primera cuando un evento está en dos cuentas
 * @returns Map día → eventos, sin los de calendarios apagados y sin repetidos
 */
export function indexar(eventosPorCuenta, cuentas) {
  const porDia = new Map();
  const vistos = new Map(); // uid|día|inicio → evento ya puesto
  for (const c of cuentas) {
    const activos = new Set(c.calendarios.filter((x) => x.activo).map((x) => x.id));
    for (const e of eventosPorCuenta[c.id] ?? []) {
      if (e.calendarioId && !activos.has(e.calendarioId)) continue;
      const clave = `${e.uid}|${e.dia}|${e.inicio}`;
      const previo = vistos.get(clave);
      if (previo) {
        // El mismo evento en otra cuenta o calendario (una invitación entre tus cuentas): se muestra una vez
        if (previo.cuenta !== e.cuenta && !previo.tambien.includes(e.cuenta)) previo.tambien.push(e.cuenta);
        continue;
      }
      const copia = { ...e, tambien: [] };
      vistos.set(clave, copia);
      if (!porDia.has(e.dia)) porDia.set(e.dia, []);
      porDia.get(e.dia).push(copia);
    }
  }
  for (const evs of porDia.values()) evs.sort(ordenar);
  return porDia;
}

export const ordenar = (a, b) => b.todoElDia - a.todoElDia || a.inicio - b.inicio || a.fin - b.fin;
