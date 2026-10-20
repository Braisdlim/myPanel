// Estado de la app (Svelte 5): ruta, fecha de hoy, tareas guardadas en el dispositivo y ajustes.
import { crearAlmacen } from "./almacen.js";
import { hoyISO, minutosAhora, sumarDias } from "./fechas.js";
import { crearTarea, crearProyecto, completar } from "./tareas.js";
import { pedirToken, revocar, listarCalendarios, listarEventos, convertirEvento, colorLibre, TokenCaducado } from "./google.js";

export const SECTORES = [
  { id: "hoy", nombre: "Hoy", icono: "sun" },
  { id: "calendario", nombre: "Calendario", icono: "calendar" },
  { id: "tareas", nombre: "Tareas", icono: "circle-check" },
  { id: "finanzas", nombre: "Finanzas", icono: "trending-up" },
  { id: "atencion", nombre: "Pide atención", icono: "bell" },
  { id: "asistente", nombre: "Asistente", icono: "sparkles" },
];

const AJUSTES_INICIALES = { id: "general", tema: "sistema", guardarEn: "preguntar" };

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
  cuentas: [], // cuentas conectadas de verdad (Google)
  eventos: {}, // id de cuenta → eventos guardados en el dispositivo
  sync: {}, // id de cuenta → { estado: "ok" | "cargando" | "error", mensaje, actualizado }
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
  app.cargado = true;
  leerRuta();
  addEventListener("hashchange", leerRuta);
  setInterval(() => { app.hoy = hoyISO(); app.ahora = minutosAhora(); }, 30_000);
}

// ---------- ruta (#/sector/…) ----------
function leerRuta() {
  const partes = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  app.ruta = partes.length && SECTORES.concat({ id: "ajustes" }).some((s) => s.id === partes[0]) ? partes : ["hoy"];
}
export function ir(...partes) {
  const h = "#/" + partes.map(encodeURIComponent).join("/");
  if (location.hash !== h) location.hash = h; else leerRuta();
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
  app.cuentas = []; app.eventos = {}; app.sync = {};
}

// ---------- cuentas de Google (solo lectura) ----------
const tokens = new Map(); // solo en memoria: id de cuenta → { token, caduca }
const VENTANA = [-60, 180]; // días de eventos que se guardan alrededor de hoy

async function token(cuenta) {
  const t = tokens.get(cuenta.id);
  if (t && t.caduca > Date.now()) return t.token;
  const nuevo = await pedirToken({ correo: cuenta.correo });
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
