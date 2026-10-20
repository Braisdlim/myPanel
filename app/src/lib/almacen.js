// Almacén local de Pauta: IndexedDB en el dispositivo, sin servidor (D-041; SQLite llegará con la sincronización).
// Si IndexedDB no está disponible (navegación privada estricta), guarda en memoria y lo dice (`persistente = false`).

const NOMBRE = "pauta";
const VERSION = 1;
const COLECCIONES = ["tareas", "proyectos", "ajustes"];

function abrir() {
  return new Promise((ok, mal) => {
    const pet = indexedDB.open(NOMBRE, VERSION);
    pet.onupgradeneeded = () => {
      for (const c of COLECCIONES) if (!pet.result.objectStoreNames.contains(c)) pet.result.createObjectStore(c, { keyPath: "id" });
    };
    pet.onsuccess = () => ok(pet.result);
    pet.onerror = () => mal(pet.error);
  });
}

function enMemoria() {
  const datos = Object.fromEntries(COLECCIONES.map((c) => [c, new Map()]));
  return {
    persistente: false,
    async todos(c) { return [...datos[c].values()].map((x) => structuredClone(x)); },
    async guardar(c, x) { datos[c].set(x.id, structuredClone(x)); },
    async borrar(c, id) { datos[c].delete(id); },
    async vaciar() { for (const c of COLECCIONES) datos[c].clear(); },
  };
}

export async function crearAlmacen() {
  if (typeof indexedDB === "undefined") return enMemoria();
  let db;
  try { db = await abrir(); } catch { return enMemoria(); }
  const op = (c, modo, f) => new Promise((ok, mal) => {
    const tx = db.transaction(c, modo);
    const r = f(tx.objectStore(c));
    tx.oncomplete = () => ok(r?.result);
    tx.onerror = () => mal(tx.error);
  });
  return {
    persistente: true,
    todos: (c) => op(c, "readonly", (s) => s.getAll()),
    guardar: (c, x) => op(c, "readwrite", (s) => s.put($snapshot(x))),
    borrar: (c, id) => op(c, "readwrite", (s) => s.delete(id)),
    vaciar: () => Promise.all(COLECCIONES.map((c) => op(c, "readwrite", (s) => s.clear()))),
  };
}

// Copia plana de un objeto (los de Svelte 5 son proxies que IndexedDB no puede clonar).
function $snapshot(x) { return JSON.parse(JSON.stringify(x)); }

export const nuevoId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
