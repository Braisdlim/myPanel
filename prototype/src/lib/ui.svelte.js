// Estado compartido del prototipo. Se inicializa desde la URL para poder capturar cada combinación.

export const COMPOSITIONS = [
  { id: "v2", name: "v2 · Propuesta" },
  { id: "a", name: "v1 A · Lista serena" },
  { id: "b", name: "v1 B · Línea del día" },
  { id: "c", name: "v1 C · Foco" },
];
export const SCREENS = [
  { id: "hoy", name: "Hoy" },
  { id: "planificar", name: "Planificar (v2)" },
  { id: "pendientes", name: "Pendientes" },
  { id: "captura", name: "Captura" },
  { id: "busqueda", name: "Búsqueda" },
  { id: "sistema", name: "Sistema de diseño (v2)" },
];
export const STATES = [
  { id: "normal", name: "Normal" },
  { id: "vacio", name: "Vacío" },
  { id: "cargando", name: "Cargando" },
  { id: "error", name: "Error" },
  { id: "conflicto", name: "Conflicto" },
];

export const ui = $state({
  comp: "v2",
  screen: "hoy",
  estado: "normal",
  theme: "system",
  font: "outfit",
  accent: "lavanda",
  bare: false,
  expanded: null,
  completed: [],
  toast: null,
});

export function initFromUrl() {
  // Si el visor ya fijó un tema, se respeta
  const hostTheme = document.documentElement.getAttribute("data-theme");
  if (hostTheme === "dark" || hostTheme === "light") ui.theme = hostTheme;
  const p = new URLSearchParams(location.search);
  for (const k of ["comp", "screen", "estado", "theme", "font", "accent"]) if (p.get(k)) ui[k] = p.get(k);
  ui.bare = p.has("bare");
}

export function syncUrl() {
  const p = new URLSearchParams();
  p.set("comp", ui.comp);
  p.set("screen", ui.screen);
  p.set("estado", ui.estado);
  if (ui.theme !== "system") p.set("theme", ui.theme);
  if (ui.font !== "outfit") p.set("font", ui.font);
  if (ui.accent !== "lavanda") p.set("accent", ui.accent);
  if (ui.bare) p.set("bare", "");
  try { history.replaceState(null, "", `?${p}`); } catch {}
}

export function applyTheme() {
  const root = document.documentElement;
  if (ui.theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", ui.theme);
  if (ui.font === "outfit") root.removeAttribute("data-font");
  else root.setAttribute("data-font", ui.font);
  if (ui.accent === "lavanda") root.removeAttribute("data-accent");
  else root.setAttribute("data-accent", ui.accent);
  try { localStorage.setItem("mypanel-theme", ui.theme); } catch {}
}

export function toggleDone(id) {
  ui.completed = ui.completed.includes(id) ? ui.completed.filter((x) => x !== id) : [...ui.completed, id];
}

let toastTimer;
export function showToast(text) {
  ui.toast = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (ui.toast = null), 2600);
}

export function go(screen) {
  ui.screen = screen;
  ui.expanded = null;
}
