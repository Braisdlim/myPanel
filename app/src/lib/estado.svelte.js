// Estado de la app (Svelte 5): ruta, fecha de hoy, tareas guardadas en el dispositivo y ajustes.
import { tick } from "svelte";
import { crearAlmacen } from "./almacen.js";
import { hoyISO, minutosAhora, sumarDias } from "./fechas.js";
import { crearTarea, crearProyecto, completar } from "./tareas.js";
import { pedirToken, revocar, listarCalendarios, listarEventos, convertirEvento, colorLibre, TokenCaducado, cuerpoEvento, comprobarEvento, crearEvento, leerEvento, calendariosPropios, cuerpoMover, cambiarEvento, leerOCancelado } from "./google.js";
import { clavesDe, claveOcurrencia } from "./calendario.js";
import { HORARIO_INICIAL } from "./horario.js";

export const SECTORES = [
  { id: "hoy", nombre: "Hoy", icono: "sun" },
  { id: "calendario", nombre: "Calendario", icono: "calendar" },
  { id: "tareas", nombre: "Tareas", icono: "circle-check" },
  { id: "finanzas", nombre: "Finanzas", icono: "trending-up" },
  { id: "atencion", nombre: "Pide atención", icono: "bell" },
  { id: "asistente", nombre: "Asistente", icono: "sparkles" },
];

const AJUSTES_INICIALES = { id: "general", tema: "sistema", guardarEn: "preguntar", trabajo: { ...HORARIO_INICIAL }, deslizarSecciones: true };

export const app = $state({
  hoy: hoyISO(),
  ahora: minutosAhora(),
  ruta: ["hoy"],
  tareas: [],
  proyectos: [],
  ajustes: { ...AJUSTES_INICIALES },
  cargado: false,
  persistente: true,
  movil: false,
  apuntar: { abierto: false, texto: "" },
  navegacion: { como: "inicio", n: 0 }, // cómo se llegó a la pantalla actual (D-056)
  cuentas: [], // cuentas conectadas de verdad (Google)
  eventos: {}, // id de cuenta → eventos guardados en el dispositivo
  sync: {}, // id de cuenta → { estado: "ok" | "cargando" | "error", mensaje, actualizado }
  noVoy: [], // claves de ocurrencias marcadas «No voy esta vez» (solo en Pauta; no se escribe en Google)
  aviso: null,
});

let almacen;

export async function iniciar() {
  almacen = await crearAlmacen();
  app.persistente = almacen.persistente;
  const [tareas, proyectos, ajustes, cuentas, eventos] = await Promise.all(["tareas", "proyectos", "ajustes", "cuentas", "eventos"].map((c) => almacen.todos(c)));
  app.cuentas = cuentas.sort((a, b) => a.conectada.localeCompare(b.conectada));
  app.eventos = Object.fromEntries(eventos.map((e) => [e.id, e.eventos]));
  app.sync = Object.fromEntries(eventos.map((e) => [e.id, { estado: "ok", mensaje: "", actualizado: e.actualizado, desde: e.desde, hasta: e.hasta }]));
  app.tareas = tareas;
  app.proyectos = proyectos.sort((a, b) => a.orden - b.orden);
  app.ajustes = { ...AJUSTES_INICIALES, ...(ajustes.find((a) => a.id === "general") ?? {}) };
  app.noVoy = ajustes.find((a) => a.id === "noVoy")?.claves ?? [];
  app.cargado = true;
  leerRuta();
  addEventListener("hashchange", leerRuta);
  setInterval(() => { app.hoy = hoyISO(); app.ahora = minutosAhora(); }, 30_000);
}

// ---------- ruta (#/sector/…) ----------
// Historial como en una app nativa (D-056): «atrás» vuelve a la pantalla anterior, no a cada semana que pasaste.
// - ir(): pantalla nueva o entrar en algo (un día desde el mes, un fondo, una sección de Ajustes): añade al historial.
// - sustituir(): moverse dentro de la misma pantalla (fechas, escala, pestañas hermanas): reemplaza la entrada.
// Cada pantalla recuerda dónde estabas desplazado; al volver con «atrás» o «adelante» se recupera.
let origen = "inicio"; // "nueva" | "sustituir" | "historial" (atrás/adelante) | "inicio"
let claveActual = location.hash;
const posiciones = new Map(); // ruta → desplazamiento de .app__main
// Pila propia del historial para saber si «atrás/adelante» va hacia atrás o hacia delante (el navegador no lo dice)
let pila = [location.hash], indice = 0;
let proximaTransicion = null; // la que pide quien navega: "siguiente" | "anterior" | "ninguna"

/** Cómo se anima el cambio (D-057): entrar (desde la derecha), salir (hacia la derecha), fundido o pasar fechas. */
function elegirTransicion(como, antes, despues) {
  if (proximaTransicion) { const t = proximaTransicion; proximaTransicion = null; return t; }
  const sector = (h) => h.replace(/^#\/?/, "").split(/[/?]/)[0] || "hoy";
  const mismo = sector(antes) === sector(despues);
  if (como === "nueva") return mismo ? "entrar" : "fundido";
  if (como === "historial") {
    if (pila[indice - 1] === despues) { indice--; return mismo ? "salir" : "fundido"; }
    if (pila[indice + 1] === despues) { indice++; return mismo ? "entrar" : "fundido"; }
    return "fundido";
  }
  if (como === "sustituir") return "fundido";
  return "ninguna";
}

function leerRuta() {
  const principal = document.querySelector(".app__main");
  if (principal) posiciones.set(claveActual, principal.scrollTop);
  const como = origen;
  origen = "historial"; // lo que no venga de ir() ni de sustituir() es atrás/adelante del navegador o de Android
  if (como === "nueva") { pila = [...pila.slice(0, indice + 1), location.hash]; indice = pila.length - 1; }
  if (como === "sustituir") pila[indice] = location.hash;
  const transicion = elegirTransicion(como, claveActual, location.hash);
  claveActual = location.hash;

  const aplicar = () => {
    app.navegacion = { como, n: (app.navegacion?.n ?? 0) + 1 };
    const [ruta, consulta = ""] = location.hash.replace(/^#\/?/, "").split("?");
    // Acceso directo del icono instalado («Apuntar»): #/hoy?apuntar abre la captura y deja la ruta limpia
    if (/(^|&)apuntar\b/.test(consulta)) { app.apuntar = { abierto: true, texto: "" }; history.replaceState(null, "", `#/${ruta}`); }
    const partes = ruta.split("/").filter(Boolean).map(decodeURIComponent);
    app.ruta = partes.length && SECTORES.concat({ id: "ajustes" }).some((s) => s.id === partes[0]) ? partes : ["hoy"];
  };
  // Tras pintar: arriba si es nueva; donde estabas si vuelves con atrás/adelante (antes de la foto de la transición)
  const colocar = () => {
    const main = document.querySelector(".app__main");
    if (!main) return;
    if (como === "historial") main.scrollTop = posiciones.get(location.hash) ?? 0;
    else if (como === "nueva") main.scrollTop = 0;
  };

  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!app.cargado || transicion === "ninguna" || sinMovimiento || !document.startViewTransition) { aplicar(); tick().then(colocar); return; }
  const raiz = document.documentElement;
  raiz.dataset.transicion = transicion;
  const vt = document.startViewTransition(async () => { aplicar(); await tick(); colocar(); });
  vt.finished.finally(() => { if (raiz.dataset.transicion === transicion) delete raiz.dataset.transicion; });
}
const hashDe = (partes) => "#/" + partes.map(encodeURIComponent).join("/");
/** Pantalla nueva (añade al historial). Opcional al final: `{ transicion: "ninguna" }` si ya se animó con el dedo. */
export function ir(...partes) {
  const opciones = typeof partes.at(-1) === "object" ? partes.pop() : {};
  const h = hashDe(partes);
  origen = "nueva";
  proximaTransicion = opciones.transicion ?? null;
  if (location.hash !== h) location.hash = h; else { proximaTransicion = null; leerRuta(); }
}
/** Moverse dentro de la misma pantalla. `transicion`: "siguiente" o "anterior" al pasar fechas; "ninguna" si ya se animó con el dedo. */
export function sustituir(...partes) {
  const opciones = typeof partes.at(-1) === "object" ? partes.pop() : {};
  const h = hashDe(partes);
  if (location.hash === h) return;
  origen = "sustituir";
  proximaTransicion = opciones.transicion ?? null;
  location.replace(h);
}

// ---------- tareas ----------
export async function guardarTarea(t) {
  const i = app.tareas.findIndex((x) => x.id === t.id);
  if (i === -1) app.tareas.push(t); else app.tareas[i] = t;
  await almacen.guardar("tareas", t);
}
export async function nuevaTarea(datos) {
  const t = crearTarea(datos);
  await guardarTarea(t);
  avisar(`Apuntada: ${t.titulo}`);
  return t;
}
export async function alternar(t) { await guardarTarea(completar(t)); }
export async function borrarTarea(t) {
  app.tareas = app.tareas.filter((x) => x.id !== t.id);
  await almacen.borrar("tareas", t.id);
  avisar(`Borrada: ${t.titulo}`);
}
export async function nuevoProyecto(nombre) {
  const p = crearProyecto(nombre);
  app.proyectos.push(p);
  await almacen.guardar("proyectos", p);
  return p;
}

// ---------- ajustes ----------
export async function cambiarAjuste(clave, valor) {
  app.ajustes[clave] = valor;
  await almacen.guardar("ajustes", { ...app.ajustes });
}

/** Exporta todo lo guardado en el dispositivo (las tareas y proyectos son tuyos). */
export function exportar() {
  return JSON.stringify({ app: "Pauta", version: 1, exportado: new Date().toISOString(), tareas: app.tareas, proyectos: app.proyectos }, null, 2);
}
export async function borrarTodo() {
  for (const c of app.cuentas) if (tokens.get(c.id)) revocar(tokens.get(c.id).token);
  tokens.clear();
  await almacen.vaciar();
  app.tareas = []; app.proyectos = []; app.ajustes = { ...AJUSTES_INICIALES };
  app.cuentas = []; app.eventos = {}; app.sync = {}; app.noVoy = [];
}

// ---------- cuentas de Google (solo lectura) ----------
const tokens = new Map(); // solo en memoria: id de cuenta → { token, caduca }
const VENTANA = [-60, 180]; // días de eventos que se guardan alrededor de hoy

/** Un token vivo para la cuenta. Si la cuenta tiene la escritura activada, el token la incluye. */
async function token(cuenta) {
  const t = tokens.get(cuenta.id);
  if (t && t.caduca > Date.now() && (t.escritura || !cuenta.escritura)) return t.token;
  const nuevo = await pedirToken({ correo: cuenta.correo, escritura: !!cuenta.escritura });
  tokens.set(cuenta.id, nuevo);
  return nuevo.token;
}

/** Conecta una cuenta de Google nueva (o reconecta una que ya estaba). Llamar desde un clic. */
export async function conectarGoogle() {
  const t = await pedirToken();
  const calendarios = await listarCalendarios(t.token);
  const principal = calendarios.find((c) => c.principal);
  const correo = principal?.id ?? calendarios[0]?.id;
  if (!correo) throw new Error("La cuenta no tiene calendarios.");
  let cuenta = app.cuentas.find((c) => c.id === correo);
  if (!cuenta) {
    cuenta = { id: correo, correo, nombre: correo, proveedor: "Google", color: colorLibre(app.cuentas.map((c) => c.color)), escritura: false, conectada: new Date().toISOString(), calendarios };
    app.cuentas.push(cuenta);
  } else {
    cuenta.calendarios = calendarios.map((c) => ({ ...c, activo: cuenta.calendarios.find((x) => x.id === c.id)?.activo ?? c.activo }));
  }
  tokens.set(correo, t);
  await almacen.guardar("cuentas", cuenta);
  await actualizarCuenta(cuenta);
  return cuenta;
}

/** Vuelve a traer los eventos de una cuenta. Si el permiso caducó, lo pide de nuevo (desde un clic). */
export async function actualizarCuenta(cuenta) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  app.sync[c.id] = { ...(app.sync[c.id] ?? {}), estado: "cargando", mensaje: "" };
  try {
    let tk = await token(c);
    const desde = sumarDias(app.hoy, VENTANA[0]), hasta = sumarDias(app.hoy, VENTANA[1]);
    const eventos = [];
    for (const cal of c.calendarios.filter((x) => x.activo)) {
      let crudos;
      try { crudos = await listarEventos(tk, cal.id, desde, hasta); }
      catch (e) { if (!(e instanceof TokenCaducado)) throw e; tokens.delete(c.id); tk = await token(c); crudos = await listarEventos(tk, cal.id, desde, hasta); }
      for (const ev of crudos) eventos.push(...convertirEvento(ev, cal, c.id));
    }
    const actualizado = new Date().toISOString();
    app.eventos[c.id] = eventos;
    app.sync[c.id] = { estado: "ok", mensaje: "", actualizado, desde, hasta };
    await almacen.guardar("eventos", { id: c.id, actualizado, desde, hasta, eventos });
  } catch (e) {
    app.sync[c.id] = { ...(app.sync[c.id] ?? {}), estado: "error", mensaje: e.message };
    throw e;
  }
}

/** Actualiza todas las cuentas, una tras otra. Devuelve los errores para enseñarlos (no se pierde ninguno). */
export async function actualizarTodo() {
  const errores = [];
  for (const c of app.cuentas) {
    try { await actualizarCuenta(c); } catch (e) { errores.push(`${c.nombre}: ${e.message}`); }
  }
  return errores;
}

export async function cambiarCalendario(cuenta, calendarioId, activo) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  c.calendarios = c.calendarios.map((x) => (x.id === calendarioId ? { ...x, activo } : x));
  await almacen.guardar("cuentas", c);
}

// ---------- crear eventos (D-050) ----------

/** Activa crear eventos en una cuenta: pide el permiso de Google (desde un clic). Empieza apagado (D-032, D-034). */
export async function activarEscritura(cuenta) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  const nuevo = await pedirToken({ correo: c.correo, escritura: true });
  tokens.set(c.id, nuevo);
  c.escritura = true;
  c.calendarioEscritura ??= calendariosPropios(c)[0]?.id ?? c.correo;
  await almacen.guardar("cuentas", $state.snapshot(c));
}

/** Deja de crear eventos en la cuenta. El permiso sigue en Google hasta que lo retires allí o desconectes la cuenta. */
export async function desactivarEscritura(cuenta) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  c.escritura = false;
  const t = tokens.get(c.id);
  if (t?.escritura) tokens.delete(c.id); // el siguiente token vuelve a ser solo de lectura
  if (app.ajustes.guardarEn === c.id) await cambiarAjuste("guardarEn", "preguntar");
  await almacen.guardar("cuentas", $state.snapshot(c));
}

export async function elegirCalendarioEscritura(cuenta, calendarioId) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  c.calendarioEscritura = calendarioId;
  await almacen.guardar("cuentas", $state.snapshot(c));
}

/**
 * Crea el evento en Google, lo relee y lo compara con lo pedido. Llamar desde el clic de confirmación.
 * @returns {{ enlace: string, diferencias: string[] }}
 */
export async function crearEventoEn(cuenta, calendarioId, datos) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  if (!c?.escritura) throw new Error("Esta cuenta no tiene activado crear eventos.");
  const cal = c.calendarios.find((x) => x.id === calendarioId);
  if (!cal || !calendariosPropios(c).some((x) => x.id === calendarioId)) throw new Error("Solo se pueden crear eventos en calendarios tuyos.");
  const cuerpo = cuerpoEvento(datos, Intl.DateTimeFormat().resolvedOptions().timeZone);
  let tk = await token(c);
  let creado;
  try { creado = await crearEvento(tk, calendarioId, cuerpo); }
  catch (e) { if (!(e instanceof TokenCaducado)) throw e; tokens.delete(c.id); tk = await token(c); creado = await crearEvento(tk, calendarioId, cuerpo); }
  // Relectura: lo que cuenta es lo que Google tiene guardado, no lo que respondió al crear
  const leido = await leerEvento(tk, calendarioId, creado.id);
  const diferencias = comprobarEvento(cuerpo, leido);
  const nuevos = convertirEvento(leido, cal, c.id);
  app.eventos[c.id] = [...(app.eventos[c.id] ?? []).filter((e) => e.gid !== leido.id), ...nuevos];
  const s = app.sync[c.id] ?? {};
  await almacen.guardar("eventos", { id: c.id, actualizado: s.actualizado ?? new Date().toISOString(), desde: s.desde, hasta: s.hasta, eventos: $state.snapshot(app.eventos[c.id]) });
  return { enlace: leido.htmlLink ?? "", diferencias };
}

// ---------- cambiar una vez (paso 3 bis, D-052) ----------

/** «No voy esta vez»: solo en Pauta, por ocurrencia. No toca Google (sirve también en calendarios compartidos). */
export async function marcarNoVoy(evento, noVoy) {
  const claves = clavesDe(evento);
  const limite = sumarDias(app.hoy, -60); // se olvidan las de hace más de 60 días
  const vigentes = app.noVoy.filter((k) => !claves.includes(k) && k.split("|").at(-2) >= limite);
  app.noVoy = noVoy ? [...vigentes, claveOcurrencia(evento)] : vigentes;
  await almacen.guardar("ajustes", { id: "noVoy", claves: $state.snapshot(app.noVoy) });
}

/** ¿Se puede cambiar en Google? Calendario tuyo, con «Crear eventos» activado en la cuenta. */
export function sePuedeCambiar(evento) {
  const c = app.cuentas.find((x) => x.id === evento.cuenta);
  return !!c?.escritura && !!evento.gid && calendariosPropios(c).some((x) => x.id === evento.calendarioId);
}

async function conToken(c, f) {
  try { return await f(await token(c)); }
  catch (e) { if (!(e instanceof TokenCaducado)) throw e; tokens.delete(c.id); return f(await token(c)); }
}

async function guardarEventosDe(c) {
  const s = app.sync[c.id] ?? {};
  await almacen.guardar("eventos", { id: c.id, actualizado: s.actualizado ?? new Date().toISOString(), desde: s.desde, hasta: s.hasta, eventos: $state.snapshot(app.eventos[c.id]) });
}

/**
 * «Saltar esta vez»: cancela en Google solo esta ocurrencia (una excepción), relee que ya no está y que la serie
 * sigue. Llamar desde el clic de confirmación. @returns {string[]} diferencias (vacío = comprobado)
 */
export async function saltarEnGoogle(evento) {
  if (!sePuedeCambiar(evento) || !evento.serie) throw new Error("Solo se puede saltar una ocurrencia de una serie en un calendario tuyo.");
  const c = app.cuentas.find((x) => x.id === evento.cuenta);
  return conToken(c, async (tk) => {
    await cambiarEvento(tk, evento.calendarioId, evento.gid, { status: "cancelled" });
    const ocurrencia = await leerOCancelado(tk, evento.calendarioId, evento.gid);
    const serie = await leerOCancelado(tk, evento.calendarioId, evento.serie);
    const dif = [];
    if (ocurrencia.status !== "cancelled") dif.push("La ocurrencia sigue en Google.");
    if (serie.status === "cancelled") dif.push("¡La serie ya no aparece en Google! Revísala en Google Calendar.");
    if (ocurrencia.status === "cancelled") {
      app.eventos[c.id] = (app.eventos[c.id] ?? []).filter((e) => e.gid !== evento.gid);
      await guardarEventosDe(c);
    }
    return dif;
  });
}

/**
 * «Mover esta vez»: cambia en Google solo la hora de este evento (si es de una serie, solo esta ocurrencia),
 * relee y compara. Llamar desde el clic de confirmación. @returns {string[]} diferencias
 */
export async function moverEnGoogle(evento, { dia, inicio, fin }) {
  if (!sePuedeCambiar(evento)) throw new Error("Solo se pueden mover eventos de calendarios tuyos.");
  const c = app.cuentas.find((x) => x.id === evento.cuenta);
  const cal = c.calendarios.find((x) => x.id === evento.calendarioId);
  const cambios = cuerpoMover({ dia, inicio, fin }, Intl.DateTimeFormat().resolvedOptions().timeZone);
  return conToken(c, async (tk) => {
    await cambiarEvento(tk, evento.calendarioId, evento.gid, cambios);
    const leido = await leerOCancelado(tk, evento.calendarioId, evento.gid);
    const dif = comprobarEvento(cambios, leido);
    if (evento.serie) {
      const serie = await leerOCancelado(tk, evento.calendarioId, evento.serie);
      if (serie.status === "cancelled") dif.push("¡La serie ya no aparece en Google! Revísala en Google Calendar.");
    }
    if (leido.status !== "cancelled") {
      app.eventos[c.id] = [...(app.eventos[c.id] ?? []).filter((e) => e.gid !== evento.gid), ...convertirEvento(leido, cal, c.id)];
      await guardarEventosDe(c);
    }
    return dif;
  });
}

export async function renombrarCuenta(cuenta, nombre) {
  const c = app.cuentas.find((x) => x.id === cuenta.id);
  c.nombre = nombre.trim() || c.correo;
  await almacen.guardar("cuentas", c);
}

/** ¿Hay un permiso vivo en esta pestaña? Sin él, Pauta no puede retirarlo en Google al desconectar. */
export const tienePermiso = (cuenta) => (tokens.get(cuenta.id)?.caduca ?? 0) > Date.now();

/** Borra la cuenta y su copia local. Devuelve si se pudo retirar también el permiso en Google. */
export async function desconectarCuenta(cuenta) {
  const t = tokens.get(cuenta.id);
  const retirado = !!t && t.caduca > Date.now();
  if (t) revocar(t.token);
  tokens.delete(cuenta.id);
  app.cuentas = app.cuentas.filter((c) => c.id !== cuenta.id);
  delete app.eventos[cuenta.id];
  delete app.sync[cuenta.id];
  await almacen.borrar("cuentas", cuenta.id);
  await almacen.borrar("eventos", cuenta.id);
  return retirado;
}

let temporizador;
export function avisar(texto) {
  app.aviso = texto;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (app.aviso = null), 3200);
}
