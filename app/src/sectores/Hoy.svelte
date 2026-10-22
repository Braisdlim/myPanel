<script>
  import { app, ir } from "../lib/estado.svelte.js";
  import { deHoy, minutosPlaneados } from "../lib/tareas.js";
  import { eventosDelDia, conflictos, cuenta, esReal, bloquea } from "../lib/agenda.svelte.js";
  import { FONDOS, serie, euros, porcentaje } from "../lib/ejemplo.js";
  import { larga, rango, hora, duracion, sumarDias, corta } from "../lib/fechas.js";
  import Dos from "../componentes/Dos.svelte";
  import FilaTarea from "../componentes/FilaTarea.svelte";
  import DetalleTarea from "../componentes/DetalleTarea.svelte";
  import Icono from "../componentes/Icono.svelte";

  const FIN_DIA = 22 * 60;
  const eventos = $derived(eventosDelDia(app.hoy, app.hoy));
  const conHora = $derived(eventos.filter((e) => !e.todoElDia));
  const tareas = $derived(deHoy(app.tareas, app.hoy));
  const siguiente = $derived(conHora.find((e) => e.fin > app.ahora && bloquea(e) && !e.trabajo));
  const conTrabajo = $derived(conHora.some((e) => e.trabajo));
  const manana = $derived(eventosDelDia(sumarDias(app.hoy, 1), app.hoy));
  const choques = $derived(conflictos([...eventos, ...manana]));
  const atrasadas = $derived(app.tareas.filter((t) => !t.hecha && t.cuando && t.cuando < app.hoy).length);

  // Capacidad: tiempo libre de ahora a las 22:00 descontando eventos y tareas con duración
  const ocupado = $derived(conHora.filter((e) => bloquea(e) && e.fin > app.ahora && e.inicio < FIN_DIA).reduce((s, e) => s + Math.min(e.fin, FIN_DIA) - Math.max(e.inicio, app.ahora), 0));
  const planeado = $derived(minutosPlaneados(app.tareas, app.hoy));
  const disponible = $derived(Math.max(0, FIN_DIA - app.ahora));
  const libre = $derived(Math.max(0, disponible - ocupado - planeado));
  const pct = $derived(disponible ? Math.min(100, Math.round(((ocupado + planeado) / disponible) * 100)) : 100);

  // Huecos libres de al menos 30 min hasta las 22:00
  const huecos = $derived.by(() => {
    const out = []; let t = Math.max(app.ahora, 8 * 60);
    for (const e of conHora.filter((e) => bloquea(e) && e.fin > t).sort((a, b) => a.inicio - b.inicio)) {
      if (e.inicio - t >= 30) out.push([t, e.inicio]);
      t = Math.max(t, e.fin);
    }
    if (FIN_DIA - t >= 30) out.push([t, FIN_DIA]);
    return out;
  });

  const valorFondo = (f) => { const s = serie(f, sumarDias(app.hoy, -1)); const a = s.at(-1).v, b = s.at(-2).v; return { valor: a * f.participaciones, dia: a / b - 1, fecha: s.at(-1).dia }; };
  const dinero = $derived.by(() => {
    const vs = FONDOS.map(valorFondo);
    const total = vs.reduce((s, v) => s + v.valor, 0);
    const ayer = vs.reduce((s, v) => s + v.valor / (1 + v.dia), 0);
    return { total, dia: total / ayer - 1, fecha: vs[0].fecha };
  });

  let elegidaId = $state(null);
  const elegida = $derived(app.tareas.find((t) => t.id === elegidaId));
  const enMin = (m) => (m <= 0 ? "ahora" : m < 60 ? `en ${m} min` : `en ${duracion(m)}`);
</script>

{#snippet principal()}
  <div class="cabecera">
    <div><h1>Hoy</h1><p class="fecha">{larga(app.hoy)}</p></div>
    {#if app.movil}<button class="pa-btn pa-btn--icon" aria-label="Ajustes" onclick={() => ir("ajustes")}><Icono n="settings" tam={20} /></button>{/if}
  </div>

  <section class="pa-card capacidad" aria-label="Tiempo libre">
    <div class="pa-capacity" class:pa-capacity--over={libre === 0 && disponible > 0}>
      <div class="pa-capacity__nums"><span>{disponible ? `Te quedan ${duracion(libre)} libres hasta las 22:00` : "El día ya ha terminado"}</span><span>{duracion(ocupado)} de {conTrabajo ? "trabajo y eventos" : "eventos"} · {duracion(planeado)} de tareas</span></div>
      <div class="pa-capacity__bar"><span class="pa-capacity__fill" style="--p: {pct}%"></span></div>
    </div>
  </section>

  {#if app.movil && (choques.length || atrasadas)}<div class="avisos-movil">{@render avisos()}</div>{/if}

  <div class="pa-section"><Icono n="calendar" /><span class="pa-label">eventos de hoy</span>{#if !esReal()}<span class="etiqueta-ejemplo">ejemplo</span>{/if}</div>
  <ul class="pa-list eventos">
    {#each eventos as e (e.id)}
      <li class="pa-row" class:pasado={!e.todoElDia && e.fin <= app.ahora}>
        <span class="pa-dot {e.cuenta ? 'pa-dot--' + cuenta(e.cuenta).color : ''}" class:opcional={e.opcional} class:trabajo={e.trabajo}></span>
        <span class="pa-row__main"><span class="pa-row__title"><span class:tachado={e.noVoy}>{e.titulo}</span>{#if e.noVoy}<span class="pa-faint"> · no vas esta vez</span>{:else if e.opcional}<span class="pa-faint"> · opcional</span>{/if}</span><span class="pa-row__meta">{e.trabajo ? "Tu horario de trabajo" : e.cuenta ? cuenta(e.cuenta).nombre : "Aviso"}{e.calendario && e.calendario !== cuenta(e.cuenta).correo ? ` · ${e.calendario}` : ""}{e.lugar ? ` · ${e.lugar}` : ""}</span></span>
        <span class="pa-row__end">{e.todoElDia ? "todo el día" : rango(e.inicio, e.fin)}</span>
      </li>
    {:else}
      <li class="pa-row pa-faint">Nada en el calendario hoy.</li>
    {/each}
  </ul>

  <div class="pa-section"><Icono n="circle-check" /><span class="pa-label">tareas de hoy</span></div>
  {#if tareas.length}
    <ul class="pa-list">{#each tareas as t (t.id)}<FilaTarea {t} mostrarDia={t.cuando !== app.hoy} seleccionada={t.id === elegidaId} alElegir={(x) => (elegidaId = x.id)} />{/each}</ul>
  {:else}
    <div class="sin-tareas"><span class="pa-faint">Sin tareas para hoy.</span><button class="pa-btn pa-btn--sm pa-btn--plain" onclick={() => (app.apuntar = { abierto: true, texto: "", contexto: null })}><Icono n="plus" />Apuntar</button></div>
  {/if}
{/snippet}

{#snippet avisos()}
  <div class="avisos">
    {#each choques.slice(0, 2) as [a, b]}
      <button class="pa-alert aviso" onclick={() => ir("atencion")}>
        <span class="pa-dot pa-dot--danger"></span><span class="pa-alert__title">{a.dia === app.hoy ? "Hoy" : "Mañana"} se solapan dos planes</span>
        <span class="pa-alert__text">{a.titulo} ({cuenta(a.cuenta).nombre}) y {b.titulo} ({cuenta(b.cuenta).nombre}), {rango(Math.max(a.inicio, b.inicio), Math.min(a.fin, b.fin))}</span>
        <span class="pa-alert__src">{esReal() ? "Tus calendarios" : "Calendarios de ejemplo"}</span>
      </button>
    {/each}
    {#if atrasadas}
      <button class="pa-alert aviso" onclick={() => ir("tareas", "hoy")}><span class="pa-dot pa-dot--attention"></span><span class="pa-alert__title">{atrasadas === 1 ? "Una tarea atrasada" : `${atrasadas} tareas atrasadas`}</span><span class="pa-alert__text">Siguen en Hoy hasta que las hagas o les cambies la fecha.</span></button>
    {/if}
    {#if !choques.length && !atrasadas}<p class="pa-faint">Nada urgente.</p>{/if}
  </div>
{/snippet}

{#snippet lateral()}
  {#if elegida && !app.movil}
    <DetalleTarea t={elegida} alCerrar={() => (elegidaId = null)} />
  {:else}
    <div class="pa-label">lo siguiente</div>
    {#if siguiente}
      <h2 class="pa-insp__title">{siguiente.titulo}</h2>
      <div class="pa-insp__meta">{rango(siguiente.inicio, siguiente.fin)} · {enMin(siguiente.inicio - app.ahora)} · {cuenta(siguiente.cuenta).nombre}</div>
    {:else}
      <p class="pa-faint">Nada más en el calendario hoy.</p>
    {/if}

    <div class="pa-label bloque">pide atención</div>
    {@render avisos()}

    <div class="pa-label bloque">tu dinero hoy <span class="etiqueta-ejemplo">ejemplo</span></div>
    <button class="dinero" onclick={() => ir("finanzas")}>
      <span class="pa-figure__value">{euros(dinero.total)}</span>
      <span class="pa-delta pa-delta--solid {dinero.dia >= 0 ? 'pa-delta--up' : 'pa-delta--down'}">{porcentaje(dinero.dia)}</span>
      <span class="pa-figure__src">Valor del {corta(dinero.fecha)} · 3 fondos de ejemplo</span>
    </button>

    <div class="pa-label bloque">huecos libres</div>
    <ul class="pa-insp__rows">
      {#each huecos as [a, b]}<li><Icono n="clock" /><span class="pa-num">{rango(a, b)}<small>{duracion(b - a)}</small></span></li>{:else}<li><Icono n="clock" /><span>Sin huecos de más de 30 min</span></li>{/each}
    </ul>
  {/if}
{/snippet}

<Dos {principal} {lateral} enMovil="oculto" />

{#if app.movil && elegida}
  <div class="capa" role="presentation" onclick={(e) => e.target === e.currentTarget && (elegidaId = null)}>
    <section class="pa-sheet capa__dialogo" style="max-height: 88dvh; overflow: auto;" role="dialog" aria-modal="true" aria-label="Tarea">
      <div class="pa-sheet__grabber"></div>
      <DetalleTarea t={elegida} alCerrar={() => (elegidaId = null)} />
    </section>
  </div>
{/if}

<style>
  .fecha::first-letter { text-transform: uppercase; }
  .capacidad { margin-bottom: 8px; }
  .eventos .pa-row { min-height: 40px; }
  .pasado { opacity: 0.55; }
  .opcional { background: transparent !important; box-shadow: inset 0 0 0 2px var(--cuenta-2); }
  .trabajo { background: transparent !important; box-shadow: inset 0 0 0 2px var(--text-3); }
  .avisos-movil { margin: 12px 0 4px; }
  @media (max-width: 640px) { .capacidad .pa-capacity__nums { flex-direction: column; gap: 2px; } }
  .sin-tareas { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; }
  .tachado { text-decoration: line-through; color: var(--text-2); }
  .bloque { display: flex; align-items: center; gap: 6px; margin: 22px 0 8px; }
  .avisos { display: flex; flex-direction: column; gap: 8px; }
  .aviso { box-sizing: border-box; width: 100%; border: 0; font: inherit; color: inherit; text-align: left; cursor: pointer; }
  .dinero { all: unset; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; cursor: pointer; }
  .dinero .pa-figure__value { font-size: 28px; line-height: 34px; }
  .dinero .pa-figure__src { flex-basis: 100%; margin-top: 0; }
  .boton-apuntar { margin-top: 12px; }
  .aviso:focus-visible, .dinero:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: var(--radius-lg); }
</style>
