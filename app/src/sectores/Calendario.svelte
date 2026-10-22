<script>
  import { app, ir, actualizarTodo, sePuedeCambiar } from "../lib/estado.svelte.js";
  import { eventosDelDia, horasDelDia, cuenta, cuentas, esReal, ventana, ultimaActualizacion } from "../lib/agenda.svelte.js";
  import { finesDistintos } from "../lib/calendario.js";
  import CambiarEvento from "../componentes/CambiarEvento.svelte";
  import { sumarDias, sumarMeses, inicioSemana, inicioMes, diaSemana, desdeISO, larga, corta, mesAnio, rango, duracion, DIAS_LETRA, MESES_CORTOS, existe, haceCuanto } from "../lib/fechas.js";
  import Dos from "../componentes/Dos.svelte";
  import Rejilla from "../componentes/Rejilla.svelte";
  import Icono from "../componentes/Icono.svelte";

  const ESCALAS = [["dia", "Día"], ["semana", "Semana"], ["mes", "Mes"], ["anio", "Año"]];
  const escala = $derived(ESCALAS.some(([e]) => e === app.ruta[1]) ? app.ruta[1] : app.movil ? "mes" : "semana");
  const fecha = $derived(/^\d{4}-\d{2}-\d{2}$/.test(app.ruta[2] ?? "") ? app.ruta[2] : app.hoy);
  let elegido = $state(null);

  const titulo = $derived(escala === "dia" ? larga(fecha) : escala === "anio" ? fecha.slice(0, 4) : mesAnio(escala === "semana" ? inicioSemana(fecha) : fecha));
  function mover(n) {
    const f = escala === "dia" ? sumarDias(fecha, n) : escala === "semana" ? sumarDias(fecha, 7 * n) : escala === "mes" ? sumarMeses(fecha, n) : sumarMeses(fecha, 12 * n);
    ir("calendario", escala, f);
  }
  const semana = $derived(Array.from({ length: 7 }, (_, i) => sumarDias(inicioSemana(fecha), i)));
  const celdasMes = $derived.by(() => { const ini = inicioSemana(inicioMes(fecha)); return Array.from({ length: 42 }, (_, i) => sumarDias(ini, i)); });
  const eventosDia = $derived(eventosDelDia(fecha, app.hoy));
  const tareasDia = (d) => app.tareas.filter((t) => !t.hecha && t.cuando === d);

  // Año: horas comprometidas por día (como el mapa de GitHub)
  const anio = $derived(Number(fecha.slice(0, 4)));
  const nivel = (horas) => (horas === 0 ? 0 : horas < 1.5 ? 1 : horas < 3 ? 2 : horas < 5 ? 3 : 4);
  const mapa = $derived(Array.from({ length: 12 }, (_, m) => Array.from({ length: 31 }, (_, i) => {
    const d = i + 1; if (!existe(anio, m + 1, d)) return null;
    const iso = `${anio}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return { iso, h: horasDelDia(iso, app.hoy) };
  })));
  const elegirDia = (d) => ir("calendario", "dia", d);

  // Tus cuentas: estado de la última actualización
  const cargando = $derived(app.cuentas.some((c) => app.sync[c.id]?.estado === "cargando"));
  const conError = $derived(app.cuentas.filter((c) => app.sync[c.id]?.estado === "error"));
  let errores = $state([]);
  async function actualizar() { errores = await actualizarTodo(); }
  const resumen = $derived.by(() => {
    if (cargando) return "Actualizando…";
    if (conError.length) return `${conError.map((c) => c.nombre).join(" y ")}: sin actualizar`;
    const u = ultimaActualizacion();
    app.ahora; // se refresca cada 30 s
    return u ? `Actualizado ${haceCuanto(u)}` : "Sin actualizar todavía";
  });
  const v = $derived(ventana());
</script>

{#snippet agendaDia(d)}
  {@const evs = eventosDelDia(d, app.hoy)}
  {@const ts = tareasDia(d)}
  <ul class="pa-dayline">
    {#each evs as e (e.id)}
      <li>
        <span class="pa-dayline__time">{e.todoElDia ? "día" : `${Math.floor(e.inicio / 60)}:${String(e.inicio % 60).padStart(2, "0")}`}</span>
        <span class="pa-dayline__rail"><span class="pa-dayline__node {e.opcional || e.noVoy ? 'pa-dayline__node--optional' : e.cuenta ? 'pa-dayline__node--' + cuenta(e.cuenta).color : ''}"></span></span>
        <button class="pa-dayline__body linea" onclick={() => (elegido = e)}><b>{e.titulo}</b><span class="pa-faint">{e.todoElDia ? "todo el día" : rango(e.inicio, e.fin)} · {e.cuenta ? cuenta(e.cuenta).nombre : "aviso"}{e.noVoy ? " · no vas esta vez" : e.opcional ? " · opcional" : ""}</span></button>
      </li>
    {/each}
    {#each ts as t (t.id)}
      <li><span class="pa-dayline__time">{t.inicio !== null && t.inicio !== undefined ? `${Math.floor(t.inicio / 60)}:${String(t.inicio % 60).padStart(2, "0")}` : "—"}</span><span class="pa-dayline__rail"><span class="pa-dayline__node"></span></span><span class="pa-dayline__body"><b>{t.titulo}</b><span class="pa-faint">tarea</span></span></li>
    {/each}
    {#if !evs.length && !ts.length}<li><span></span><span></span><span class="pa-dayline__body pa-faint">Nada este día.</span></li>{/if}
  </ul>
{/snippet}

{#snippet principal()}
  <div class="cabecera barra">
    <div>
      <h1 class="titulo">{titulo}</h1>
      {#if esReal()}
        <p class="estado" class:con-error={conError.length}>{cuentas().length === 1 ? cuentas()[0].nombre : `${cuentas().length} cuentas`} · {resumen}
          <button class="pa-btn pa-btn--plain pa-btn--sm" onclick={actualizar} disabled={cargando}><Icono n="refresh-cw" tam={14} />Actualizar</button></p>
        {#each errores as e}<p class="pa-faint error" role="alert">{e}</p>{/each}
      {:else}
        <p>Calendarios de ejemplo de Gmail 1, Gmail 2 y Outlook <span class="etiqueta-ejemplo">ejemplo</span> · <a class="enlace" href="#/ajustes/cuentas">conectar los tuyos</a></p>
      {/if}
    </div>
    <div class="controles">
      <div class="pa-seg" role="group" aria-label="Escala">
        {#each ESCALAS as [e, n]}<button aria-pressed={escala === e ? "true" : "false"} onclick={() => ir("calendario", e, fecha)}>{n}</button>{/each}
      </div>
      <div class="nav">
        <button class="pa-btn pa-btn--icon" aria-label="Anterior" onclick={() => mover(-1)}><Icono n="chevron-left" /></button>
        <button class="pa-btn pa-btn--sm" onclick={() => ir("calendario", escala, app.hoy)}>Hoy</button>
        <button class="pa-btn pa-btn--icon" aria-label="Siguiente" onclick={() => mover(1)}><Icono n="chevron-right" /></button>
      </div>
    </div>
  </div>

  {#if escala === "dia"}
    {#if app.movil}
      {@render agendaDia(fecha)}
    {:else}
      <Rejilla dias={[fecha]} alElegir={(e) => (elegido = e)} elegidoId={elegido?.id} />
    {/if}
  {:else if escala === "semana"}
    {#if app.movil}
      {#each semana as d}
        <button class="dia-titulo" class:hoy={d === app.hoy} onclick={() => elegirDia(d)}>{larga(d)}</button>
        {@render agendaDia(d)}
      {/each}
    {:else}
      <Rejilla dias={semana} alElegir={(e) => (elegido = e)} elegidoId={elegido?.id} />
    {/if}
  {:else if escala === "mes"}
    <div class="mes" role="grid" aria-label={mesAnio(fecha)}>
      {#each DIAS_LETRA as l}<span class="mes__cab" role="columnheader">{l}</span>{/each}
      {#each celdasMes as d}
        {@const evs = eventosDelDia(d, app.hoy).filter((e) => !e.todoElDia || e.cuenta)}
        <button class="mes__dia" class:fuera={d.slice(5, 7) !== fecha.slice(5, 7)} class:es-hoy={d === app.hoy} class:elegido={app.movil && d === fecha} role="gridcell"
          onclick={() => (app.movil ? ir("calendario", "mes", d) : elegirDia(d))} aria-label={larga(d)}>
          <span class="num pa-num">{desdeISO(d).getDate()}</span>
          {#if app.movil}
            <span class="puntos">{#each evs.slice(0, 3) as e}<i style="background: var(--cuenta-{e.cuenta ? cuenta(e.cuenta).color.slice(1) : 1});"></i>{/each}</span>
          {:else}
            {#each evs.slice(0, 3) as e}<span class="mes__ev" class:opcional={e.opcional || e.noVoy} class:tachado={e.noVoy}><i style="background: var(--cuenta-{e.cuenta ? cuenta(e.cuenta).color.slice(1) : 1});"></i>{e.todoElDia ? "" : `${Math.floor(e.inicio / 60)}:${String(e.inicio % 60).padStart(2, "0")} `}{e.titulo}</span>{/each}
            {#if evs.length > 3}<span class="mas">y {evs.length - 3} más</span>{/if}
          {/if}
        </button>
      {/each}
    </div>
    {#if app.movil}
      <div class="dia-titulo hoy">{larga(fecha)}</div>
      {@render agendaDia(fecha)}
    {/if}
  {:else}
    <p class="pa-faint">Horas comprometidas cada día: cuanto más intenso, más ocupado. Toca un día para abrirlo.{#if v} Hay eventos guardados del {corta(v.desde)} al {corta(v.hasta)}.{/if}</p>
    <div class="pa-year" class:pa-year--vertical={app.movil} role="grid" aria-label="Año {anio}">
      {#if app.movil}
        <span></span>{#each MESES_CORTOS as m}<span class="pa-year__m">{m[0].toUpperCase()}</span>{/each}
        {#each Array(31) as _, i}
          <span class="pa-year__m">{i + 1}</span>
          {#each mapa as fila}
            {@const c = fila[i]}
            {#if c}<button class="pa-year__c" data-h={nivel(c.h)} data-hoy={c.iso === app.hoy ? "" : undefined} aria-label="{larga(c.iso)}: {c.h.toLocaleString('es-ES', { maximumFractionDigits: 1 })} h" onclick={() => elegirDia(c.iso)}></button>{:else}<span class="pa-year__c" hidden></span>{/if}
          {/each}
        {/each}
      {:else}
        {#each mapa as fila, m}
          <span class="pa-year__m">{MESES_CORTOS[m]}</span>
          {#each fila as c}
            {#if c}<button class="pa-year__c" data-h={nivel(c.h)} data-hoy={c.iso === app.hoy ? "" : undefined} aria-label="{larga(c.iso)}: {c.h.toLocaleString('es-ES', { maximumFractionDigits: 1 })} h" onclick={() => elegirDia(c.iso)}></button>{:else}<span class="pa-year__c" hidden></span>{/if}
          {/each}
        {/each}
      {/if}
    </div>
    <div class="pa-heatlegend leyenda">menos {#each [0, 1, 2, 3, 4] as k}<i style="background: var(--heat-{k});"></i>{/each} más</div>
  {/if}
{/snippet}

{#snippet lateral()}
  {#if elegido}
    {@const vivo = eventosDelDia(elegido.dia, app.hoy).find((e) => e.id === elegido.id) ?? null}
    {@const ev = vivo ?? elegido}
    <div class="pa-label">{ev.tarea ? "tarea" : "evento"}{ev.ejemplo ? " de ejemplo" : ""}{!vivo && !ev.tarea && !ev.ejemplo ? " · ya no está aquí" : ""}</div>
    <h2 class="pa-insp__title" class:tachado={ev.noVoy || !vivo}>{ev.titulo}</h2>
    <div class="pa-insp__meta">{corta(elegido.dia)}{elegido.todoElDia ? " · todo el día" : `, ${rango(elegido.inicio, elegido.fin)} · ${duracion(elegido.fin - elegido.inicio)}`}</div>
    <ul class="pa-insp__rows">
      {#if elegido.cuenta}<li><span class="pa-dot pa-dot--{cuenta(elegido.cuenta).color}" style="margin: 4px;"></span><span>{cuenta(elegido.cuenta).nombre} · {cuenta(elegido.cuenta).proveedor}<small>{elegido.calendario && elegido.calendario !== cuenta(elegido.cuenta).correo ? `Calendario «${elegido.calendario}» · ` : ""}{sePuedeCambiar(elegido) ? "Pauta puede cambiarlo, siempre con tu confirmación" : "Solo lectura"}</small></span></li>{/if}
      {#if elegido.fuentes?.length}
        {@const otros = [...new Set(elegido.fuentes.map((f) => (f.cuenta !== elegido.cuenta ? `${cuenta(f.cuenta).nombre}${f.calendario && f.calendario !== cuenta(f.cuenta).correo ? ` («${f.calendario}»)` : ""}` : `«${f.calendario}»`)))]}
        {@const fines = finesDistintos(elegido)}
        <li><Icono n="layers" /><span>También en {otros.join(", ").replace(/, ([^,]*)$/, " y $1")}
          <small>{elegido.unidoPor === "parecido" ? `Mismo título y hora en ${new Set([elegido.calendarioId, ...elegido.fuentes.map((f) => f.calendarioId)]).size} calendarios: Pauta lo muestra una vez` : "Es el mismo evento: se muestra una vez"}{fines.length ? ` · otro calendario dice hasta las ${fines.map((f) => (f >= 1440 ? "0:00" : `${Math.floor(f / 60)}:${String(f % 60).padStart(2, "0")}`)).join(" o ")}` : ""}</small></span></li>
      {/if}
      {#if elegido.lugar}<li><Icono n="map-pin" /><span>{elegido.lugar}</span></li>{/if}
      {#if elegido.serie}<li><Icono n="repeat" /><span>Se repite<small>Lo que cambies aquí es solo de esta vez</small></span></li>{/if}
      {#if elegido.opcional}<li><Icono n="repeat" /><span>Cada viernes · opcional<small>{elegido.nota}</small></span></li>{/if}
      {#if !esReal() && !elegido.ejemplo && !elegido.tarea && elegido.cuenta}<li><Icono n="info" /><span>Es un hecho real<small>Su calendario está por confirmar (P-001)</small></span></li>{/if}
    </ul>
    {#if esReal()}
      <CambiarEvento evento={vivo} />
    {:else}
      <div class="pa-insp__actions">
        <button class="pa-btn pa-btn--sm" disabled title="Al conectar tus calendarios">Mover esta vez</button>
        {#if elegido.opcional}<button class="pa-btn pa-btn--sm" disabled title="Al conectar tus calendarios">Saltar esta vez</button>{/if}
      </div>
      <p class="pa-faint nota">Cambiar eventos llegará al conectar tus calendarios, siempre con confirmación y la cuenta de destino a la vista.</p>
    {/if}
  {:else}
    <div class="pa-label">cuentas</div>
    <ul class="pa-insp__rows">
      {#each cuentas() as c (c.id)}<li><span class="pa-dot pa-dot--{c.color}" style="margin: 4px;"></span><span class="nombre-cuenta">{c.nombre}<small>{c.proveedor} · {c.escritura ? "con escritura" : "solo lectura"}{esReal() ? ` · ${c.calendarios.filter((x) => x.activo).length} de ${c.calendarios.length} calendarios` : " · ejemplo"}</small></span></li>{/each}
    </ul>
    <p class="pa-faint nota">Elige un evento para ver su detalle.</p>
  {/if}
{/snippet}

<Dos {principal} lateral={app.movil ? null : lateral} ancha={escala !== "anio"} />

{#if app.movil && elegido}
  <div class="capa" role="presentation" onclick={(e) => e.target === e.currentTarget && (elegido = null)}>
    <section class="pa-sheet capa__dialogo" role="dialog" aria-modal="true" aria-label="Evento">
      <div class="pa-sheet__grabber"></div>
      {@render lateral()}
      <button class="pa-btn" style="width: 100%; margin-top: 12px;" onclick={() => (elegido = null)}>Cerrar</button>
    </section>
  </div>
{/if}

<style>
  .barra { flex-wrap: wrap; }
  .titulo::first-letter { text-transform: uppercase; }
  .controles { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .nav { display: flex; align-items: center; gap: 2px; }
  .mes { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
  .mes__cab { padding: 6px 8px; font-size: 12px; color: var(--text-3); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .mes__dia { all: unset; box-sizing: border-box; min-height: 104px; padding: 6px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 2px; cursor: pointer; overflow: hidden; }
  .mes__dia:hover { background: var(--hover); }
  .mes__dia:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
  .mes__dia.fuera .num { color: var(--text-3); }
  .num { font-size: 12.5px; font-weight: 600; align-self: flex-start; padding: 0 6px; border-radius: var(--radius-pill); }
  .es-hoy .num { background: var(--accent); color: var(--on-accent); }
  .mes__ev { display: flex; align-items: center; gap: 5px; font-size: 11.5px; line-height: 16px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mes__ev i, .puntos i { width: 6px; height: 6px; border-radius: 50%; flex: none; display: inline-block; }
  .mes__ev.opcional i { background: transparent !important; box-shadow: inset 0 0 0 1.5px var(--cuenta-2); }
  .mas { font-size: 11px; color: var(--text-3); }
  .tachado { text-decoration: line-through; }
  .leyenda { margin-top: 10px; }
  .pa-year button.pa-year__c { border: 0; padding: 0; cursor: pointer; }
  .dia-titulo { all: unset; display: flex; align-items: center; min-height: 44px; margin: 8px 0 0; font-weight: 600; font-size: 14px; color: var(--text-2); }
  .dia-titulo::first-letter { text-transform: uppercase; }
  .dia-titulo.hoy { color: var(--accent); }
  .linea { all: unset; display: flex; flex-direction: column; cursor: pointer; padding-bottom: 14px; min-height: 44px; box-sizing: border-box; }
  .linea b, .pa-dayline__body b { font-weight: 500; }
  .pa-dayline__body { display: flex; flex-direction: column; }
  .nota { margin-top: 14px; font-size: 12.5px; }
  .estado { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
  .estado.con-error { color: var(--attention); }
  .error { margin: 4px 0 0; }
  .enlace { color: var(--accent); text-underline-offset: 2px; }
  .nombre-cuenta { min-width: 0; overflow-wrap: anywhere; }
  a.pa-btn { text-decoration: none; }
  @media (max-width: 640px) {
    .mes { border: 0; }
    .mes__cab { border: 0; text-align: center; padding: 4px 0; }
    .mes__dia { min-height: 46px; border: 0; align-items: center; justify-content: center; gap: 3px; padding: 2px; border-radius: 12px; }
    .mes__dia.elegido { background: var(--hover); }
    .num { font-size: 15px; padding: 2px 8px; }
    .puntos { display: flex; gap: 3px; height: 6px; }
    .controles { width: 100%; justify-content: space-between; }
  }
</style>
