<script>
  // Rejilla de tiempo (día o semana) con el sistema de diseño: pa-tg y pa-ev.
  import { app } from "../lib/estado.svelte.js";
  import { eventosDelDia, carriles, conflictos, cuenta } from "../lib/ejemplo.js";
  import { DIAS_CORTOS, diaSemana, desdeISO, rango } from "../lib/fechas.js";

  let { dias, alElegir = () => {}, elegidoId = null, hora0 = 7, horas = 17, alto = 46 } = $props();
  const porDia = $derived(dias.map((d) => {
    const evs = eventosDelDia(d, app.hoy);
    const tareas = app.tareas.filter((t) => !t.hecha && t.cuando === d && t.inicio !== null && t.inicio !== undefined)
      .map((t) => ({ id: "t" + t.id, titulo: t.titulo, inicio: t.inicio, fin: t.inicio + (t.duracionMin ?? 30), tarea: true, dia: d }));
    const conHora = [...evs.filter((e) => !e.todoElDia), ...tareas];
    const choque = new Set(conflictos(evs).flat().map((e) => e.id));
    return { d, todoElDia: evs.filter((e) => e.todoElDia), conHora, lanes: carriles(conHora), choque };
  }));
  const h = (m) => Math.max(0, (m - hora0 * 60) / 60);
</script>

<div class="rejilla" style="--hour-height: {alto}px;">
  <div class="pa-tg" style="--days: {dias.length};">
    <div class="pa-tg__corner"></div>
    {#each porDia as c}
      <div class="pa-tg__day" class:pa-tg__day--today={c.d === app.hoy}>{DIAS_CORTOS[diaSemana(c.d)]} <span class="pa-tg__num">{desdeISO(c.d).getDate()}</span></div>
    {/each}
    {#if porDia.some((c) => c.todoElDia.length)}
      <div class="pa-tg__corner todo">todo el día</div>
      {#each porDia as c}
        <div class="todo">{#each c.todoElDia as e}<span class="chip-dia" class:aviso={!e.cuenta}>{e.titulo}</span>{/each}</div>
      {/each}
    {/if}
    <div class="pa-tg__hours">{#each Array(horas) as _, i}<div class="pa-tg__hour">{i ? `${hora0 + i}:00` : ""}</div>{/each}</div>
    {#each porDia as c}
      <div class="pa-tg__col" style="height: calc({horas} * var(--hour-height));">
        {#each c.conHora as e (e.id)}
          {@const l = c.lanes.get(e.id)}
          <button class="pa-ev {e.tarea ? 'pa-ev--task' : e.opcional ? 'pa-ev--optional' : 'pa-ev--' + cuenta(e.cuenta).color}" class:pa-ev--conflict={c.choque.has(e.id)} class:elegido={e.id === elegidoId}
            style="--start: {h(e.inicio)}; --dur: {Math.max(0.42, h(e.fin) - h(e.inicio))}; --lane: {l.carril}; --lanes: {l.carriles};"
            onclick={() => alElegir(e)} aria-label="{e.titulo}, {rango(e.inicio, e.fin)}{e.tarea ? ', tarea' : ', ' + cuenta(e.cuenta).nombre}">
            {e.titulo}<small>{rango(e.inicio, e.fin)}</small>
          </button>
        {/each}
        {#if c.d === app.hoy && app.ahora > hora0 * 60}<div class="pa-tg__now" style="--at: {h(app.ahora)};"></div>{/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .rejilla { overflow: auto; }
  .pa-ev { border: 0; text-align: left; cursor: pointer; font-family: var(--font-sans); }
  .pa-ev.elegido { outline: 2px solid var(--accent); outline-offset: 0; }
  .todo { min-height: 28px; padding: 3px; border-bottom: 1px solid var(--line); border-left: 1px solid var(--line); display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--text-3); align-items: stretch; justify-content: center; }
  .pa-tg__corner.todo { border-left: 0; text-align: right; padding-right: 6px; line-height: 12px; }
  .chip-dia { padding: 2px 6px; border-radius: var(--radius-xs); background: var(--cuenta-1-soft); color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chip-dia.aviso { background: var(--hover); color: var(--text-2); }
</style>
