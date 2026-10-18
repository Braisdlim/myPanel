// Estado compartido del prototipo. Se inicializa desde la URL para poder capturar cada combinación.

export const COMPOSITIONS = [
  { id: "a", name: "A · Lista serena" },
  { id: "b", name: "B · Línea del día" },
  { id: "c", name: "C · Foco" },
];
export const SCREENS = [
  { id: "hoy", name: "Hoy" },
  { id: "captura", name: "Captura" },
  { id: "busqueda", name: "Búsqueda" },
];
export const STATES = [
  { id: "normal", name: "Normal" },
  { id: "vacio", name: "Vacío" },
  { id: "cargando", name: "Cargando" },
  { id: "error", name: "Error" },
  { id: "conflicto", name: "Conflicto" },
];

export const ui = $state({
  comp: "a",
  screen: "hoy",
  estado: "normal",
  theme: "system",
  font: "figtree",
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
  for (const k of ["comp", "screen", "estado", "theme", "font"]) if (p.get(k)) ui[k] = p.get(k);
  ui.bare = p.has("bare");
}

export function syncUrl() {
  const p = new URLSearchParams();
  p.set("comp", ui.comp);
  p.set("screen", ui.screen);
  p.set("estado", ui.estado);
  if (ui.theme !== "system") p.set("theme", ui.theme);
  if (ui.font !== "figtree") p.set("font", ui.font);
  if (ui.bare) p.set("bare", "");
  try { history.replaceState(null, "", `?${p}`); } catch {}
}

export function applyTheme() {
  const root = document.documentElement;
  if (ui.theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", ui.theme);
  if (ui.font === "figtree") root.removeAttribute("data-font");
  else root.setAttribute("data-font", ui.font);
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
