<script>
  import { onMount, tick } from "svelte";
  import { app, iniciar, ir, SECTORES, desplazamientoGuardado } from "./lib/estado.svelte.js";
  import { contar } from "./lib/tareas.js";
  import Icono from "./componentes/Icono.svelte";
  import Lateral from "./componentes/Lateral.svelte";
  import Apuntar from "./componentes/Apuntar.svelte";
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

  function teclas(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); app.apuntar.abierto = true; }
  }

  const Vista = $derived(VISTAS[app.ruta[0]] ?? Hoy);
  // Título que se encoge al desplazar, como el título grande de iOS: al bajar no pierdes en qué pantalla estás
  let compacto = $state(false);
  const nombreVista = $derived(app.ruta[0] === "ajustes" ? "Ajustes" : SECTORES.find((s) => s.id === app.ruta[0])?.nombre ?? "Hoy");
  $effect(() => { app.ruta; compacto = false; });
  $effect(() => { document.title = nombreVista === "Hoy" ? "Pauta" : `${nombreVista} · Pauta`; });

  // Tras navegar (D-056): arriba si es una pantalla nueva; donde estabas si vuelves con atrás/adelante.
  // El foco va al título de la pantalla, para que el lector de pantalla diga dónde estás (no en «inicio» ni al pasar fechas).
  $effect(() => {
    const { como, n } = app.navegacion;
    if (!n || como === "inicio") return;
    tick().then(() => requestAnimationFrame(() => {
      const main = document.querySelector(".app__main");
      if (!main) return;
      if (como === "historial") main.scrollTop = desplazamientoGuardado();
      else if (como === "nueva") main.scrollTop = 0;
      if (como === "sustituir" || document.querySelector("body > .capa")) return;
      const h1 = main.querySelector("h1");
      if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
    }));
  });
  const conteos = $derived(contar(app.tareas, app.hoy));
  const TABS = [["hoy", "Hoy", "sun"], ["calendario", "Calendario", "calendar"], null, ["tareas", "Tareas", "circle-check"], ["finanzas", "Finanzas", "trending-up"]];
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
    <main class="app__main" id="contenido" onscroll={(e) => (compacto = app.movil && e.currentTarget.scrollTop > 44)}>
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

{#if app.aviso}
  <div class="toast" role="status">{app.aviso}</div>
{/if}

{#if app.cargado && !app.persistente}
  <div class="toast" role="alert">Este navegador no deja guardar en el dispositivo: lo que apuntes se perderá al cerrar.</div>
{/if}

<style>
  .movil-solo { display: none; }
  /* Barra con el título pequeño: altura cero en el flujo; aparece al desplazar */
  .compacto { position: sticky; top: 0; height: 0; z-index: 5; }
  .compacto span { display: flex; align-items: center; justify-content: center; height: 44px; background: var(--bg); border-bottom: 1px solid var(--line); font-size: 15px; font-weight: 600; opacity: 0; transform: translateY(-4px); transition: opacity 160ms ease, transform 160ms ease; pointer-events: none; }
  .compacto.visible span { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .compacto span { transition: none; } }
  @media (max-width: 640px) { .movil-solo { display: grid; } }
</style>
