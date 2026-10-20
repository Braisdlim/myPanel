<script>
  import { app, ir, nuevaTarea } from "../lib/estado.svelte.js";
  import { LISTAS, filtrar, porDia, contar } from "../lib/tareas.js";
  import { larga, distancia } from "../lib/fechas.js";
  import { analizar } from "../lib/analizador.js";
  import Dos from "../componentes/Dos.svelte";
  import FilaTarea from "../componentes/FilaTarea.svelte";
  import DetalleTarea from "../componentes/DetalleTarea.svelte";
  import Icono from "../componentes/Icono.svelte";

  const r = $derived(app.ruta);
  const proyectoId = $derived(r[1] === "p" ? r[2] : null);
  const proyecto = $derived(app.proyectos.find((p) => p.id === proyectoId));
  const portada = $derived(app.movil && !r[1]); // en el móvil, #/tareas enseña las listas
  const lista = $derived(LISTAS.find((l) => l.id === (r[1] ?? "entrada")) ?? LISTAS[0]);
  const items = $derived(filtrar(app.tareas, proyectoId ? null : lista.id, app.hoy, proyectoId));
  const conteos = $derived(contar(app.tareas, app.hoy));
  let elegidaId = $state(null);
  const elegida = $derived(app.tareas.find((t) => t.id === elegidaId));
  let nueva = $state("");

  const TEXTOS = {
    entrada: ["Lo que apuntas sin ordenar", "Aquí cae lo que apuntas sin fecha. Ordénalo cuando tengas un momento."],
    hoy: ["Lo de hoy, lo atrasado y lo que vence hoy", "Nada para hoy. Apunta algo con «hoy» o elige una fecha."],
    programadas: ["Lo que tiene fecha a partir de mañana", "Nada programado."],
    cualquier: ["Cuando tengas un hueco", "Vacío. Mueve aquí lo que no tiene fecha pero quieres hacer."],
    algun: ["Ideas sin prisa", "Vacío. Lo que quizá hagas algún día."],
    registro: ["Lo que ya has hecho", "Todavía no has completado nada."],
  };

  async function crear(e) {
    e.preventDefault();
    const texto = nueva.trim();
    if (!texto) return;
    const a = analizar(texto, app.hoy);
    const contexto = { proyectoId, lista: ["cualquier", "algun"].includes(lista.id) && !proyectoId ? lista.id : "entrada" };
    if (a.dudas.length) {
      // Algo es ambiguo («el lunes» siendo lunes, «a las 9»): se pregunta en «Apuntar», no se adivina
      app.apuntar = { abierto: true, texto, contexto };
      nueva = "";
      return;
    }
    const datos = { titulo: a.titulo || texto, proyectoId };
    if (a.fecha && !a.dudas.length) datos.cuando = a.fecha;
    if (a.inicio !== null && !a.dudas.some((d) => d.tipo === "hora")) { datos.inicio = a.inicio; datos.duracionMin = a.fin - a.inicio; }
    if (!proyectoId) {
      if (lista.id === "hoy" && !datos.cuando) datos.cuando = app.hoy;
      if (lista.id === "cualquier" || lista.id === "algun") datos.lista = lista.id;
    }
    await nuevaTarea(datos);
    nueva = "";
  }
</script>

{#snippet principal()}
  {#if portada}
    <div class="cabecera"><div><h1>Tareas</h1></div></div>
    <ul class="pa-list pa-list--lines">
      {#each LISTAS as l}
        <li class="pa-row pa-row--hover"><button class="enlace" onclick={() => ir("tareas", l.id)}><Icono n={l.icono} tam={20} /><span class="pa-row__main"><span class="pa-row__title">{l.nombre}</span></span><span class="pa-row__end">{conteos[l.id] || ""}<Icono n="chevron-right" /></span></button></li>
      {/each}
    </ul>
    <div class="pa-section"><span class="pa-label">proyectos</span></div>
    <ul class="pa-list pa-list--lines">
      {#each app.proyectos as p}
        <li class="pa-row pa-row--hover"><button class="enlace" onclick={() => ir("tareas", "p", p.id)}><Icono n="circle" tam={20} /><span class="pa-row__main"><span class="pa-row__title">{p.nombre}</span></span><Icono n="chevron-right" /></button></li>
      {:else}
        <li class="pa-row pa-faint">Aún no hay proyectos. Créalos desde la barra lateral en el ordenador.</li>
      {/each}
    </ul>
  {:else}
    {#if app.movil}<button class="pa-btn pa-btn--plain volver" onclick={() => ir("tareas")}><Icono n="chevron-left" />Tareas</button>{/if}
    <div class="cabecera">
      <div>
        <h1><Icono n={proyecto ? "circle" : lista.icono} tam={22} estilo="color: var(--accent); vertical-align: -2px; margin-right: 8px;" />{proyecto?.nombre ?? lista.nombre}</h1>
        <p>{proyecto ? "Proyecto" : TEXTOS[lista.id][0]}</p>
      </div>
    </div>

    {#if lista.id !== "registro" || proyectoId}
      <form class="nueva" onsubmit={crear}>
        <Icono n="plus" />
        <input class="pa-field" bind:value={nueva} placeholder={lista.id === "hoy" ? "Nueva tarea para hoy…" : "Nueva tarea… «pedir cita el martes»"} aria-label="Nueva tarea" />
      </form>
    {/if}

    {#if !items.length}
      <div class="vacio"><b>{proyecto ? "Proyecto vacío" : "Nada por aquí"}</b>{proyecto ? "Añade la primera tarea arriba." : TEXTOS[lista.id][1]}</div>
    {:else if lista.id === "programadas" && !proyectoId}
      {#each porDia(items) as [dia, ts]}
        <div class="pa-section"><span class="dia">{larga(dia)}</span><span class="pa-faint">{distancia(dia, app.hoy)}</span></div>
        <ul class="pa-list">{#each ts as t (t.id)}<FilaTarea {t} mostrarDia={false} seleccionada={t.id === elegidaId} alElegir={(x) => (elegidaId = x.id)} />{/each}</ul>
      {/each}
    {:else}
      <ul class="pa-list">{#each items as t (t.id)}<FilaTarea {t} seleccionada={t.id === elegidaId} alElegir={(x) => (elegidaId = x.id)} />{/each}</ul>
    {/if}
  {/if}
{/snippet}

{#snippet lateral()}
  {#if elegida}
    <DetalleTarea t={elegida} alCerrar={() => (elegidaId = null)} />
  {:else}
    <div class="pa-label">detalle</div>
    <p class="pa-faint">Elige una tarea para ver y cambiar su fecha, hora, duración, notas y pasos.</p>
    <ul class="pa-insp__rows">
      <li><Icono n="inbox" /><span>Apunta con <span class="pa-kbd">⌘</span> <span class="pa-kbd">K</span><small>«Renovar el DNI», «llamar a la gestoría el lunes a las 12»</small></span></li>
      <li><Icono n="hard-drive" /><span>Guardadas en este dispositivo<small>Aún no se sincronizan con tus otros dispositivos</small></span></li>
    </ul>
  {/if}
{/snippet}

<Dos {principal} lateral={app.movil ? null : lateral} />

{#if app.movil && elegida}
  <div class="capa" role="presentation" onclick={(e) => e.target === e.currentTarget && (elegidaId = null)}>
    <section class="pa-sheet capa__dialogo hoja-tarea" role="dialog" aria-modal="true" aria-label="Tarea">
      <div class="pa-sheet__grabber"></div>
      <DetalleTarea t={elegida} alCerrar={() => (elegidaId = null)} />
    </section>
  </div>
{/if}

<style>
  .cabecera h1 { display: flex; align-items: center; }
  .nueva { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; padding: 0 12px; color: var(--text-3); }
  .nueva .pa-field { background: transparent; box-shadow: none; padding: 0; }
  .nueva .pa-field:focus { box-shadow: none; }
  .dia { font-weight: 600; font-size: 13px; color: var(--text); }
  .dia::first-letter { text-transform: uppercase; }
  .pa-section { justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 4px; }
  .enlace { all: unset; display: flex; align-items: center; gap: 14px; flex: 1; cursor: pointer; color: var(--text-2); }
  .enlace .pa-row__title { color: var(--text); }
  .volver { margin: -6px 0 4px -8px; }
  .hoja-tarea { max-height: 88dvh; overflow: auto; }
</style>
