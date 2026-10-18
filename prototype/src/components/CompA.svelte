<script>
  // A · Lista serena: una columna, jerarquía por tipografía, captura con un botón flotante.
  import Icon from "./Icon.svelte";
  import DayHeader from "./DayHeader.svelte";
  import NextCard from "./NextCard.svelte";
  import Section from "./Section.svelte";
  import EventRow from "./EventRow.svelte";
  import TaskRow from "./TaskRow.svelte";
  import Attention from "./Attention.svelte";
  import Upcoming from "./Upcoming.svelte";
  import States from "./States.svelte";
  import Search from "./Search.svelte";
  import Backlog from "./Backlog.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { events, tasksToday, done, now, accounts } from "../data/demo.js";
  import { ui, go } from "../lib/ui.svelte.js";

  const later = events.filter((e) => e.startMin > now.minutes).slice(1);
  const view = $derived(ui.screen === "captura" ? "hoy" : ui.screen);
  const nav = [
    { id: "hoy", name: "Hoy", icon: "today" },
    { id: "pendientes", name: "Pendientes", icon: "inbox" },
    { id: "busqueda", name: "Buscar", icon: "search" },
  ];
</script>

<div class="shell">
  <aside class="side" aria-label="Navegación">
    <p class="brand">myPanel</p>
    <button class="new" onclick={() => go("captura")}><Icon name="plus" size={18} />Apuntar algo<kbd>Ctrl K</kbd></button>
    <nav>
      {#each nav as n}
        <button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}><Icon name={n.icon} size={19} />{n.name}</button>
      {/each}
    </nav>
    <div class="accts">
      <p>Cuentas</p>
      {#each Object.values(accounts) as a}<div class="acct"><AccountTag id={a.id} /><small>{a.email}</small></div>{/each}
    </div>
  </aside>

  <main class="main">
    {#if view === "hoy"}
      <DayHeader />
      {#if ui.estado === "error"}<div class="gap"><States kind="error" /></div>{/if}
      {#if ui.estado === "cargando"}
        <div class="gap"><States kind="cargando" rows={5} /></div>
      {:else if ui.estado === "vacio"}
        <States kind="vacio" />
      {:else}
        <div class="gap"><NextCard /></div>
        <Section title="Más tarde"><ul>{#each later as e}<EventRow event={e} />{/each}</ul></Section>
        <Section title="Para hacer hoy" count={tasksToday.length}><ul>{#each tasksToday as t}<TaskRow task={t} />{/each}</ul></Section>
        <Section title="Pide atención" count={2}><Attention /></Section>
        <Section title="Hecho hoy" count={done.length} collapsible startOpen={false}><ul>{#each done as d}<TaskRow task={d} doneAt={d.at} />{/each}</ul></Section>
      {/if}
      <div class="mobile-only"><Section title="Próximos días"><Upcoming /></Section></div>
    {:else if view === "pendientes"}
      <Backlog />
    {:else}
      <h1 class="page">Buscar</h1>
      <Search />
    {/if}
  </main>

  <aside class="aside" aria-label="Próximos días">
    {#if view === "hoy"}<Section title="Próximos días"><Upcoming /></Section>{/if}
  </aside>

  <nav class="tabbar" aria-label="Secciones">
    {#each nav as n}
      <button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}><Icon name={n.icon} size={22} /><span>{n.name}</span></button>
    {/each}
    <button class="fab" aria-label="Apuntar algo" onclick={() => go("captura")}><Icon name="plus" size={26} /></button>
  </nav>
</div>

<style>
  .shell { min-height: 100dvh; }
  .main { max-width: 640px; margin: 0 auto; padding: var(--s4) var(--s4) calc(120px + env(safe-area-inset-bottom)); }
  .gap { margin-top: var(--s5); }
  .page { margin: 0 0 var(--s5); padding: var(--s2) var(--s2) 0; font-size: var(--fs-display); line-height: var(--lh-display); font-weight: var(--w-strong); letter-spacing: -.02em; }
  .side, .aside { display: none; }

  .tabbar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
    display: grid; grid-template-columns: repeat(3, 1fr) 88px; align-items: center;
    padding: 6px var(--s2) calc(6px + env(safe-area-inset-bottom));
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: blur(18px) saturate(1.4);
    border-top: 1px solid var(--line);
  }
  .tabbar button:not(.fab) { min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; background: none; border: 0; color: var(--text-3); font-size: 11.5px; font-weight: var(--w-medium); }
  .tabbar button.on { color: var(--text); }
  .fab { justify-self: center; width: 56px; height: 56px; border-radius: 18px; border: 0; background: var(--accent-grad); color: var(--accent-ink); display: grid; place-items: center; box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--accent) 60%, transparent); transition: transform var(--t-fast) var(--ease-spring); }
  .fab:active { transform: scale(.93); }

  @media (min-width: 1024px) {
    .shell { display: grid; grid-template-columns: 260px minmax(0, 1fr) 360px; }
    .tabbar, .mobile-only { display: none; }
    .main { width: 100%; padding: var(--s10) var(--s8) var(--s10); }
    .side { display: flex; flex-direction: column; gap: var(--s6); position: sticky; top: 0; height: 100dvh; padding: var(--s6) var(--s4); background: color-mix(in srgb, var(--surface-1) 55%, transparent); backdrop-filter: blur(20px); border-right: 1px solid var(--line); }
    .aside { display: block; padding: var(--s10) var(--s6) 0 0; }
    .aside :global(.section) { margin-top: 74px; }
    .brand { margin: 0 var(--s2); font-weight: var(--w-strong); letter-spacing: -.01em; }
    .new { display: flex; align-items: center; gap: var(--s2); min-height: 44px; padding: 0 var(--s3); border-radius: var(--r-row); border: 0; background: var(--accent-grad); color: var(--accent-ink); font-weight: var(--w-strong); }
    kbd { margin-left: auto; font: inherit; font-size: 11px; font-weight: var(--w-medium); opacity: .7; }
    nav { display: grid; gap: 2px; }
    nav button { display: flex; align-items: center; gap: var(--s3); min-height: 40px; padding: 0 var(--s3); border-radius: var(--r-chip); border: 0; background: none; color: var(--text-2); font-weight: var(--w-medium); text-align: left; }
    nav button:hover { background: var(--surface-1); }
    nav button.on { background: var(--surface-3); color: var(--text); }
    .accts { margin-top: auto; display: grid; gap: var(--s3); padding: 0 var(--s2); }
    .accts p { margin: 0; font-size: var(--fs-small); color: var(--text-3); font-weight: var(--w-medium); }
    .acct { display: grid; gap: 2px; }
    .acct small { font-size: 11.5px; color: var(--text-3); padding-left: 13px; }
  }
</style>
