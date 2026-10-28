<script>
  import { onMount, tick } from "svelte";
  import { app, iniciar, ir, SECTORES, FINANZAS_VISIBLE } from "./lib/estado.svelte.js";
  import { contar } from "./lib/tareas.js";
  import Icono from "./componentes/Icono.svelte";
  import Lateral from "./componentes/Lateral.svelte";
  import Apuntar from "./componentes/Apuntar.svelte";
  import Hoja from "./componentes/Hoja.svelte";
  import { deslizar } from "./lib/deslizar.js";
  import Hoy from "./sectores/Hoy.svelte";
  import Calendario from "./sectores/Calendario.svelte";
  import Tareas from "./sectores/Tareas.svelte";
  import Finanzas from "./sectores/Finanzas.svelte";
  import Atencion from "./sectores/Atencion.svelte";
  import Asistente from "./sectores/Asistente.svelte";
  import Ajustes from "./sectores/Ajustes.svelte";

  const VISTAS = { hoy: Hoy, calendario: Calendario, tareas: Tareas, finanzas: Finanzas, atencion: Atencion, asistente: Asistente, ajustes: Ajustes };
  const esMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = esMac ? "⌘" : "Ctrl";

  onMount(() => {
    iniciar();
    const mq = matchMedia("(max-width: 640px)");
    const fijar = () => (app.movil = mq.matches);
    fijar();
    mq.addEventListener("change", fijar);
    const sistema = matchMedia("(prefers-color-scheme: dark)");
    sistema.addEventListener("change", aplicarTema);
  });

  function aplicarTema() {
    const t = app.ajustes.tema;
    const oscuro = t === "dark" || (t === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = oscuro ? "dark" : "light";
    try { localStorage.setItem("pauta-tema", t); } catch {}
  }
  $effect(() => { app.ajustes.tema; aplicarTema(); });

  // Atajos (diseno/sistema/README.md): ⌘/Ctrl+K apuntar, ⌘/Ctrl+1–4 sectores, ? atajos. Los de Calendario, en su pantalla.
  // El cuarto sitio es Finanzas si está visible; si no, el Asistente (D-059)
  const CUARTO = FINANZAS_VISIBLE ? ["finanzas", "Finanzas", "trending-up"] : ["asistente", "Asistente", "sparkles"];
  const SECTOR_POR_NUMERO = ["hoy", "calendario", "tareas", CUARTO[0]];
  let verAtajos = $state(false);
  function teclas(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); app.apuntar.abierto = true; return; }
    if ((e.metaKey || e.ctrlKey) && /^[1-4]$/.test(e.key)) { e.preventDefault(); ir(SECTOR_POR_NUMERO[Number(e.key) - 1]); return; }
    const escribiendo = e.target.closest?.("input, textarea, select, [contenteditable]");
    if (e.key === "?" && !escribiendo && !document.querySelector("body > .capa")) { e.preventDefault(); verAtajos = true; }
  }
  const ATAJOS = [[`${mod} K`, "Apuntar o buscar"], [`${mod} 1–4`, `Hoy, Calendario, Tareas, ${CUARTO[1]}`], ["Alt ← / Alt →", "Atrás y adelante"], ["Esc", "Cerrar la hoja o el diálogo"],
    ["D · S · M · A", "Calendario: día, semana, mes, año"], ["T", "Calendario: hoy"], ["← / →", "Calendario: anterior y siguiente"], ["?", "Ver estos atajos"]];

  const Vista = $derived(VISTAS[app.ruta[0]] ?? Hoy);

  // Deslizar de lado para cambiar de sección en el móvil (petición del usuario, 22-10-2026), en el orden de la barra:
  // Hoy ↔ Calendario ↔ Tareas ↔ Finanzas. Dentro del Calendario, la zona del calendario pasa fechas (.deslizable);
  // su cabecera cambia de sección. Se apaga en Ajustes › General.
  const ORDEN = SECTOR_POR_NUMERO;
  const posicion = () => ORDEN.indexOf(app.ruta[0]);
  const deslizarSecciones = {
    activo: () => app.movil && app.ajustes.deslizarSecciones !== false && posicion() !== -1 && !app.apuntar.abierto,
    ignorar: ".deslizable",
    puede: (sentido) => { const i = posicion(); return i !== -1 && i + sentido >= 0 && i + sentido < ORDEN.length; },
    alSiguiente: () => ir(ORDEN[posicion() + 1], { transicion: "ninguna" }),
    alAnterior: () => ir(ORDEN[posicion() - 1], { transicion: "ninguna" }),
  };
  // Título que se encoge al desplazar, como el título grande de iOS: al bajar no pierdes en qué pantalla estás
  let compacto = $state(false);
  const nombreVista = $derived(app.ruta[0] === "ajustes" ? "Ajustes" : SECTORES.find((s) => s.id === app.ruta[0])?.nombre ?? "Hoy");
  $effect(() => { app.ruta; compacto = false; });
  $effect(() => { document.title = nombreVista === "Hoy" ? "Pauta" : `${nombreVista} · Pauta`; });

  // Tras navegar (D-056; el desplazamiento lo coloca estado.svelte.js).
  // El foco va al título de la pantalla, para que el lector de pantalla diga dónde estás (no en «inicio» ni al pasar fechas).
  $effect(() => {
    const { como, n } = app.navegacion;
    if (!n || como === "inicio") return;
    tick().then(() => requestAnimationFrame(() => {
      const main = document.querySelector(".app__main");
      if (!main) return;
      if (como === "sustituir" || document.querySelector("body > .capa")) return;
      const h1 = main.querySelector("h1");
      if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
    }));
  });
  const conteos = $derived(contar(app.tareas, app.hoy));
  const TABS = [["hoy", "Hoy", "sun"], ["calendario", "Calendario", "calendar"], null, ["tareas", "Tareas", "circle-check"], CUARTO];
</script>

<svelte:window onkeydown={teclas} />

<div class="app">
  <header class="pa-toolbar">
    <div class="marca"><span class="marca__icono" aria-hidden="true"><i></i><i></i><i></i></span>Pauta</div>
    <button class="pa-search" onclick={() => (app.apuntar.abierto = true)} aria-keyshortcuts={esMac ? "Meta+K" : "Control+K"}>
      <Icono n="search" /><span>Apunta o busca… «llamar a la gestoría el lunes»</span><span class="pa-kbd">{mod}</span><span class="pa-kbd">K</span>
    </button>
    <button class="pa-btn pa-btn--icon" aria-label="Ajustes" onclick={() => ir("ajustes")}><Icono n="settings" /></button>
  </header>

  <div class="app__body">
    <Lateral {conteos} />
    <main class="app__main" id="contenido" onscroll={(e) => (compacto = app.movil && e.currentTarget.scrollTop > 44)} use:deslizar={deslizarSecciones}>
      {#if app.movil}<div class="compacto" class:visible={compacto} aria-hidden="true"><span>{nombreVista}</span></div>{/if}
      {#if app.cargado}
        <Vista />
      {/if}
    </main>
  </div>

  <nav class="pa-tabbar movil-solo" aria-label="Sectores">
    {#each TABS as t}
      {#if t}
        <button class="pa-tab" aria-current={app.ruta[0] === t[0] ? "page" : undefined} onclick={() => ir(t[0])}><Icono n={t[2]} />{t[1]}</button>
      {:else}
        <button class="pa-tab--add" aria-label="Apuntar o preguntar" onclick={() => (app.apuntar.abierto = true)}><Icono n="plus" /></button>
      {/if}
    {/each}
  </nav>
</div>

{#if app.apuntar.abierto}
  <Apuntar {mod} />
{/if}

{#if verAtajos}
  <Hoja etiqueta="Atajos de teclado" alCerrar={() => (verAtajos = false)}>
    <div class="pa-capture atajos">
      <h2>Atajos de teclado</h2>
      <dl>{#each ATAJOS as [k, d]}<div><dt><span class="pa-kbd">{k}</span></dt><dd>{d}</dd></div>{/each}</dl>
      <div class="pa-capture__foot"><button class="pa-btn pa-btn--primary" onclick={() => (verAtajos = false)} data-foco>Cerrar</button></div>
    </div>
  </Hoja>
{/if}

{#if app.aviso}
  <div class="toast" role="status">{app.aviso}</div>
{/if}

{#if app.cargado && !app.persistente}
  <div class="toast" role="alert">Este navegador no deja guardar en el dispositivo: lo que apuntes se perderá al cerrar.</div>
{/if}

<style>
  .movil-solo { display: none; }
  .atajos h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .atajos dl { margin: 0; display: grid; gap: 8px; }
  .atajos dl div { display: grid; grid-template-columns: 150px 1fr; gap: 12px; align-items: center; }
  .atajos dt, .atajos dd { margin: 0; }
  .atajos dd { color: var(--text-2); }
  /* Barra con el título pequeño: altura cero en el flujo; aparece al desplazar */
  .compacto { position: sticky; top: 0; height: 0; z-index: 5; }
  .compacto span { display: flex; align-items: center; justify-content: center; height: 44px; background: var(--bg); border-bottom: 1px solid var(--line); font-size: 15px; font-weight: 600; opacity: 0; transform: translateY(-4px); transition: opacity 160ms ease, transform 160ms ease; pointer-events: none; }
  .compacto.visible span { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .compacto span { transition: none; } }
  @media (max-width: 640px) { .movil-solo { display: grid; } }
</style>
