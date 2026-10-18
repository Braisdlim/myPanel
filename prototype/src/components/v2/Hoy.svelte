<script>
  import Icon from "../Icon.svelte";
  import PageHead from "./PageHead.svelte";
  import Card from "./Card.svelte";
  import NextHero from "./NextHero.svelte";
  import DayRing from "./DayRing.svelte";
  import WeekBars from "./WeekBars.svelte";
  import EventRow from "../EventRow.svelte";
  import TaskRow from "../TaskRow.svelte";
  import Attention from "../Attention.svelte";
  import Upcoming from "../Upcoming.svelte";
  import States from "../States.svelte";
  import { events, tasksToday, done, now } from "../../data/demo.js";
  import { ui, go } from "../../lib/ui.svelte.js";

  const later = events.filter((e) => e.startMin > now.minutes).slice(1);
  let showDone = $state(false);
</script>

<PageHead title="Buenas tardes" subtitle="Jueves, 22 de octubre" />

{#if ui.estado === "error"}<div class="banner"><States kind="error" /></div>{/if}

{#if ui.estado === "cargando"}
  <div class="bento">
    <Card cls="c-hero"><States kind="cargando" rows={3} /></Card>
    <Card cls="c-ring"><States kind="cargando" rows={2} /></Card>
    <Card cls="c-week"><States kind="cargando" rows={2} /></Card>
  </div>
{:else if ui.estado === "vacio"}
  <div class="bento">
    <Card cls="c-hero"><States kind="vacio" /></Card>
    <Card title="Próximos días" cls="c-up" action="calendar" actionLabel="Ver la semana" onaction={() => go("planificar")}><Upcoming /></Card>
  </div>
{:else}
  <div class="bento">
    <div class="c-hero"><NextHero /></div>

    <Card title="Tu tarde" subtitle="De ahora a las 23:00" cls="c-ring" action="plan" actionLabel="Planificar la tarde" onaction={() => go("planificar")}>
      <div class="ring-wrap"><DayRing /></div>
    </Card>

    <Card title="Esta semana" subtitle="Horas comprometidas" cls="c-week" action="open" actionLabel="Abrir Planificar" onaction={() => go("planificar")}>
      <WeekBars />
    </Card>

    <Card title="Para hoy" subtitle={`${tasksToday.length} tareas y ${later.length} plan`} cls="c-today" flush>
      <ul class="list">
        {#each later as e}<EventRow event={e} />{/each}
        {#each tasksToday as t}<TaskRow task={t} />{/each}
      </ul>
      <button class="done" aria-expanded={showDone} onclick={() => (showDone = !showDone)}>
        <Icon name="check" size={15} />{done.length} hechas hoy<Icon name="down" size={15} />
      </button>
      {#if showDone}<ul class="list">{#each done as d}<TaskRow task={d} doneAt={d.at} />{/each}</ul>{/if}
    </Card>

    <Card title="Pide atención" subtitle="2 cosas" cls="c-att" flush>
      <Attention />
    </Card>

    <Card title="Próximos días" cls="c-up" action="calendar" actionLabel="Ver la semana" onaction={() => go("planificar")}>
      <Upcoming />
    </Card>
  </div>
{/if}

<style>
  .banner { margin-bottom: var(--s4); }
  .bento { display: grid; gap: var(--s4); }
  .list { list-style: none; margin: 0; padding: 0; }
  .ring-wrap { display: grid; }
  .done { display: flex; align-items: center; gap: var(--s2); min-height: 44px; margin: var(--s1) var(--s2) 0; padding: 0; border: 0; background: none; color: var(--text-3); font-size: var(--fs-meta); }
  .done :global(svg:last-child) { margin-left: auto; }
  /* En móvil: orden de lectura pensado para el pulgar */
  :global(.c-week) { order: 5; }
  :global(.c-up) { order: 6; }

  @media (min-width: 720px) and (max-width: 1023px) {
    .bento { grid-template-columns: 1fr 1fr; }
    .c-hero, :global(.c-today), :global(.c-up) { grid-column: 1 / -1; }
  }
  @media (min-width: 1024px) {
    .bento { grid-template-columns: repeat(12, 1fr); gap: var(--s5); align-items: start; }
    :global(.c-week), :global(.c-up) { order: 0; }
    .c-hero, :global(.bento > .c-hero) { grid-column: span 6; align-self: stretch; }
    .c-hero :global(.card) { height: 100%; }
    :global(.c-ring) { grid-column: span 3; align-self: stretch; }
    :global(.c-week) { grid-column: span 3; align-self: stretch; }
    :global(.c-today) { grid-column: span 4; }
    :global(.c-att) { grid-column: span 4; }
    :global(.c-up) { grid-column: span 4; }
  }
</style>
