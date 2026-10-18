<script>
  // B · Línea del día: el día como una línea de tiempo con huecos libres visibles.
  import Icon from "./Icon.svelte";
  import DayHeader from "./DayHeader.svelte";
  import Section from "./Section.svelte";
  import Attention from "./Attention.svelte";
  import Upcoming from "./Upcoming.svelte";
  import States from "./States.svelte";
  import Search from "./Search.svelte";
  import Backlog from "./Backlog.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { events, tasksToday, done, now } from "../data/demo.js";
  import { ui, go, showToast, toggleDone } from "../lib/ui.svelte.js";

  const START = Math.floor(now.minutes / 60) * 60, END = 24 * 60, H = 84;
  const y = (m) => ((m - START) / 60) * H;
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i);
  const todayEvents = events.filter((e) => e.endMin > START);
  const slots = [
    { s: 16 * 60 + 30, e: 17 * 60 + 15, label: "16:30–17:15", len: "45 min" },
    { s: 18 * 60 + 30, e: 19 * 60 + 45, label: "18:30–19:45", len: "1 h 15 min" },
  ];
  const week = [["L", 19], ["M", 20], ["X", 21], ["J", 22], ["V", 23], ["S", 24], ["D", 25]];
  let showAttention = $state(false);
  const view = $derived(ui.screen === "captura" ? "hoy" : ui.screen);
  const nav = [
    { id: "hoy", name: "Hoy", icon: "today" },
    { id: "pendientes", name: "Pendientes", icon: "inbox" },
    { id: "busqueda", name: "Buscar", icon: "search" },
  ];
</script>

<div class="shell">
  <header class="top">
    <p class="brand">myPanel</p>
    <button class="capfield" onclick={() => go("captura")}><Icon name="plus" size={18} /><span>Escribe o dicta algo pendiente</span><kbd>Ctrl K</kbd></button>
    <nav class="tnav">
      {#each nav as n}<button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}>{n.name}</button>{/each}
    </nav>
  </header>

  <div class="grid">
    <main class="main">
      {#if view === "hoy"}
        <DayHeader />
        <ol class="week" aria-label="Semana">
          {#each week as [d, n]}
            <li class:today={n === 22} class:past={n < 22}>
              <span class="wl">{d}</span><span class="wn num">{n}</span>
              <span class="wdot" class:clash={n === 23} aria-hidden="true"></span>
              {#if n === 23}<span class="sr-only">Conflicto</span>{/if}
            </li>
          {/each}
        </ol>

        {#if ui.estado === "error"}<div class="gap"><States kind="error" /></div>{/if}

        {#if ui.estado === "cargando"}
          <div class="gap"><States kind="cargando" rows={5} /></div>
        {:else if ui.estado === "vacio"}
          <States kind="vacio" />
        {:else}
          <button class="pill mobile-only" aria-expanded={showAttention} onclick={() => (showAttention = !showAttention)}>
            <Icon name="inbox" size={16} />2 cosas piden atención<Icon name="down" size={15} />
          </button>
          {#if showAttention}<div class="mobile-only"><Attention /></div>{/if}

          <div class="tray">
            <p class="tray-t">Sin hora hoy <span>Toca un hueco libre para colocarlas</span></p>
            <ul class="chips">
              {#each tasksToday as t}
                <li><button class="chip" class:done={ui.completed.includes(t.id)} onclick={() => toggleDone(t.id)} aria-pressed={ui.completed.includes(t.id)}>
                  <span class="cc" aria-hidden="true">{#if ui.completed.includes(t.id)}<Icon name="check" size={12} />{/if}</span>{t.title}{#if t.estimate}<small>{t.estimate}</small>{/if}
                </button></li>
              {/each}
            </ul>
          </div>

          <p class="before"><Icon name="check" size={15} />Esta mañana: 1 reunión y {done.length} tareas hechas</p>

          <div class="timeline" style={`height:${y(END) + 8}px`} aria-label="Línea del día desde ahora">
            {#each hours as h}
              <div class="hour num" style={`top:${y(h * 60)}px`}><span class:hide={Math.abs(h * 60 - now.minutes) < 20}>{String(h % 24).padStart(2, "0")}:00</span></div>
            {/each}
            {#each slots as s}
              <button class="slot" class:short={s.e - s.s < 60} style={`top:${y(s.s) + 2}px;height:${y(s.e) - y(s.s) - 4}px`} onclick={() => showToast(`Colocar una tarea en ${s.label}`)}>
                <span>Libre {s.len}</span><small class="num">{s.label}</small>
              </button>
            {/each}
            {#each todayEvents as e}
              <div class="ev" class:short={e.endMin - e.startMin < 60} class:rutina={e.kind === "rutina"} style={`top:${y(e.startMin) + 2}px;height:${y(e.endMin) - y(e.startMin) - 4}px;--c:var(--${e.account})`}>
                <span class="ev-t">{e.title}</span>
                <span class="ev-m"><span class="num">{e.start}–{e.end}</span>{#if e.kind === "rutina"}<span class="o"><Icon name="repeat" size={12} />Opcional</span>{/if}<AccountTag id={e.account} compact /></span>
              </div>
            {/each}
            <div class="now" style={`top:${y(now.minutes)}px`}><span class="num">{now.label}</span></div>
          </div>
        {/if}
        <div class="mobile-only"><Section title="Próximos días"><Upcoming /></Section></div>
      {:else if view === "pendientes"}
        <Backlog />
      {:else}
        <h1 class="page">Buscar</h1>
        <Search />
      {/if}
    </main>

    <aside class="aside">
      {#if view === "hoy"}
        <Section title="Pide atención" count={2}><Attention /></Section>
        <Section title="Próximos días"><Upcoming /></Section>
      {/if}
    </aside>
  </div>

  <div class="dock">
    <button class="capbar" onclick={() => go("captura")}><Icon name="plus" size={20} /><span>Escribe o dicta algo pendiente</span></button>
    <nav class="tabbar" aria-label="Secciones">
      {#each nav as n}
        <button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}><Icon name={n.icon} size={22} /><span>{n.name}</span></button>
      {/each}
    </nav>
  </div>
</div>

<style>
  .top { display: none; }
  .main { max-width: 640px; margin: 0 auto; padding: var(--s4) var(--s4) calc(170px + env(safe-area-inset-bottom)); }
  .gap { margin-top: var(--s5); }
  .page { margin: 0 0 var(--s5); padding: var(--s2) var(--s2) 0; font-size: var(--fs-display); line-height: var(--lh-display); font-weight: 720; letter-spacing: -.02em; }
  .aside { display: none; }

  .week { list-style: none; margin: var(--s5) 0 0; padding: 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .week li { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 0 6px; border-radius: 14px; }
  .wl { font-size: 11.5px; font-weight: 600; color: var(--text-3); }
  .wn { font-size: 17px; font-weight: 650; }
  .week li.past .wn { color: var(--text-3); }
  .week li.today { background: var(--text); color: var(--bg); }
  .week li.today .wl { color: color-mix(in srgb, var(--bg) 70%, transparent); }
  .wdot { width: 5px; height: 5px; border-radius: 50%; background: transparent; }
  .wdot.clash { background: var(--danger); }

  .pill { margin-top: var(--s5); display: inline-flex; align-items: center; gap: var(--s2); min-height: 40px; padding: 0 var(--s4); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: none; font-size: var(--fs-meta); font-weight: 600; color: var(--attention); }
  .tray { margin-top: var(--s5); }
  .tray-t { margin: 0 var(--s2) var(--s2); font-size: var(--fs-meta); font-weight: 650; color: var(--text-2); display: flex; justify-content: space-between; gap: var(--s3); flex-wrap: wrap; }
  .tray-t span { font-weight: 500; color: var(--text-3); font-size: var(--fs-small); }
  .chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s2); }
  .chip { display: inline-flex; align-items: center; gap: var(--s2); min-height: 44px; padding: 0 var(--s4) 0 var(--s3); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: var(--surface-1); font-size: var(--fs-meta); font-weight: 560; text-align: left; }
  .chip small { color: var(--text-3); font-weight: 500; font-size: var(--fs-small); }
  .cc { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--text-3); display: grid; place-items: center; flex: none; }
  .chip.done { color: var(--text-3); text-decoration: line-through; }
  .chip.done .cc { background: var(--ok); border-color: var(--ok); color: var(--bg); }
  .before { margin: var(--s6) var(--s2) var(--s3); display: flex; align-items: center; gap: var(--s2); font-size: var(--fs-meta); color: var(--text-3); }

  .timeline { position: relative; margin-left: 4px; }
  .hour { position: absolute; left: 50px; right: 0; height: 0; border-top: 1px solid var(--line); }
  .hour span { position: absolute; top: -8px; left: -50px; font-size: 11.5px; color: var(--text-3); font-weight: 560; }
  .hour span.hide { visibility: hidden; }
  .ev, .slot { position: absolute; left: 58px; right: 0; border-radius: 12px; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
  .ev { background: color-mix(in srgb, var(--c) 17%, var(--surface-1)); border-left: 3px solid var(--c); }
  .ev.rutina { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--c) 12%, var(--surface-1)) 0 7px, color-mix(in srgb, var(--c) 6%, var(--surface-1)) 7px 14px); border-left-style: dashed; }
  .ev-t { font-weight: 620; font-size: 15px; }
  .short { flex-direction: row; align-items: center; justify-content: space-between; gap: var(--s3); padding-top: 0; padding-bottom: 0; }
  .ev-m { display: flex; align-items: center; gap: var(--s2); font-size: var(--fs-small); color: var(--text-2); }
  .o { display: inline-flex; align-items: center; gap: 3px; }
  .slot { border: 1px dashed var(--line-strong); background: none; text-align: left; color: var(--text-2); font-size: var(--fs-meta); font-weight: 600; }
  .slot small { font-weight: 500; color: var(--text-3); font-size: var(--fs-small); }
  .slot:hover { border-color: var(--accent); color: var(--text); }
  .now { position: absolute; left: 50px; right: 0; height: 0; border-top: 2px solid var(--accent); z-index: 2; }
  .now::before { content: ""; position: absolute; left: -5px; top: -6px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
  .now span { position: absolute; left: -50px; top: -9px; font-size: 11.5px; font-weight: 700; color: var(--accent-text); }

  .dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: var(--s2) var(--s3) env(safe-area-inset-bottom); background: color-mix(in srgb, var(--bg) 84%, transparent); backdrop-filter: blur(18px) saturate(1.4); border-top: 1px solid var(--line); }
  .capbar { width: 100%; display: flex; align-items: center; gap: var(--s3); min-height: 52px; padding: 0 var(--s4); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: var(--surface-1); color: var(--text-3); font-size: 16px; text-align: left; }
  .capbar :global(svg) { color: var(--accent-text); }
  .tabbar { display: grid; grid-template-columns: repeat(3, 1fr); }
  .tabbar button { min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; background: none; border: 0; color: var(--text-3); font-size: 11.5px; font-weight: 600; }
  .tabbar button.on { color: var(--text); }

  @media (min-width: 1024px) {
    .dock, .mobile-only { display: none; }
    .top { display: grid; grid-template-columns: 200px minmax(0, 560px) 1fr; align-items: center; gap: var(--s6); position: sticky; top: 0; z-index: 10; padding: var(--s3) var(--s8); background: color-mix(in srgb, var(--bg) 80%, transparent); backdrop-filter: blur(18px); border-bottom: 1px solid var(--line); }
    .brand { margin: 0; font-weight: 720; }
    .capfield { display: flex; align-items: center; gap: var(--s3); min-height: 44px; padding: 0 var(--s4); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: var(--surface-1); color: var(--text-3); text-align: left; }
    .capfield :global(svg) { color: var(--accent-text); }
    .capfield kbd { margin-left: auto; font: inherit; font-size: 11px; }
    .tnav { justify-self: end; display: flex; gap: var(--s1); }
    .tnav button { min-height: 40px; padding: 0 var(--s4); border-radius: var(--r-pill); border: 0; background: none; color: var(--text-2); font-weight: 600; }
    .tnav button.on { background: var(--surface-3); color: var(--text); }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: var(--s10); max-width: 1180px; margin: 0 auto; padding: 0 var(--s8); }
    .main { max-width: none; margin: 0; padding: var(--s8) 0 var(--s10); }
    .aside { display: block; padding-top: var(--s8); }
    .aside :global(.section:first-child) { margin-top: 0; }
  }
</style>
