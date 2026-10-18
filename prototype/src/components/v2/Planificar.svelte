<script>
  import Icon from "../Icon.svelte";
  import PageHead from "./PageHead.svelte";
  import Card from "./Card.svelte";
  import Timeline from "./Timeline.svelte";
  import WeekBars from "./WeekBars.svelte";
  import { tasksToday, backlog } from "../../data/demo.js";
  import { ui, toggleDone, showToast } from "../../lib/ui.svelte.js";
</script>

<PageHead title="Planificar" subtitle="Coloca lo pendiente en tus huecos libres" />

<div class="grid">
  <Card title="Hoy, desde ahora" subtitle="Toca un hueco libre para colocar una tarea" cls="p-tl">
    <Timeline />
  </Card>
    <Card title="Sin hora" subtitle="Tareas de hoy y pendientes" cls="p-tray">
      <ul class="chips">
        {#each tasksToday as t}
          <li><button class="chip" class:done={ui.completed.includes(t.id)} aria-pressed={ui.completed.includes(t.id)} onclick={() => toggleDone(t.id)}>
            <span class="cc" aria-hidden="true">{#if ui.completed.includes(t.id)}<Icon name="check" size={12} />{/if}</span>{t.title}{#if t.estimate}<small class="num">{t.estimate}</small>{/if}
          </button></li>
        {/each}
        {#each backlog.slice(0, 2) as b}
          <li><button class="chip pend" onclick={() => showToast(`Propuesta para «${b.title}»: hoy de 18:30 a 18:45`)}><Icon name="inbox" size={14} />{b.title}</button></li>
        {/each}
      </ul>
    </Card>
    <Card title="Esta semana" subtitle="Horas comprometidas" cls="p-week">
      <WeekBars />
    </Card>
</div>

<style>
  .grid { display: grid; gap: var(--s4); grid-template-areas: "tray" "tl" "week"; }
  .grid > :global(.p-tl) { grid-area: tl; }
  .grid > :global(.p-tray) { grid-area: tray; }
  .grid > :global(.p-week) { grid-area: week; }
  .chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s2); }
  .chip { display: inline-flex; align-items: center; gap: var(--s2); min-height: 44px; padding: 0 var(--s4) 0 var(--s3); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: var(--surface-3); font-size: var(--fs-meta); text-align: left; }
  .chip small { color: var(--text-3); font-size: var(--fs-small); }
  .chip.pend { color: var(--text-2); border-style: dashed; background: none; }
  .chip.pend :global(svg) { color: var(--attention); }
  .cc { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--text-3); display: grid; place-items: center; flex: none; }
  .chip.done { color: var(--text-3); text-decoration: line-through; }
  .chip.done .cc { background: var(--ok); border-color: var(--ok); color: var(--bg); }
  @media (max-width: 1023px) {
    .chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 calc(var(--s5) * -1); padding: 0 var(--s5); }
    .chips li { flex: none; }
  }
  @media (min-width: 1024px) {
    .grid { grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr); grid-template-areas: "tl tray" "tl week"; grid-template-rows: auto 1fr; gap: var(--s5); align-items: start; }
  }
</style>
