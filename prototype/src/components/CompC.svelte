<script>
  // C · Foco: un único protagonista («Lo siguiente»), franja de días y un campo para buscar o apuntar.
  import Icon from "./Icon.svelte";
  import DayHeader from "./DayHeader.svelte";
  import NextCard from "./NextCard.svelte";
  import Section from "./Section.svelte";
  import EventRow from "./EventRow.svelte";
  import TaskRow from "./TaskRow.svelte";
  import Attention from "./Attention.svelte";
  import Upcoming from "./Upcoming.svelte";
  import States from "./States.svelte";
  import Backlog from "./Backlog.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { events, tasksToday, done, now, accounts, attention } from "../data/demo.js";
  import { ui, go } from "../lib/ui.svelte.js";

  const later = events.filter((e) => e.startMin > now.minutes).slice(1);
  const ticker = [["Jue", 22, "3 citas"], ["Vie", 23, "2 planes"], ["Sáb", 24, "1 plan"], ["Dom", 25, "Libre"], ["Lun", 26, "1 plan"], ["Mar", 27, "Libre"], ["Mié", 28, "Libre"]];
  const month = [...Array(3).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  let showAttention = $state(false);
  const view = $derived(ui.screen === "pendientes" ? "pendientes" : "hoy");
</script>

<div class="shell">
  <aside class="left" aria-label="Calendario y cuentas">
    <p class="brand">myPanel</p>
    <div class="month" aria-label="Octubre de 2026">
      <p class="m-t">Octubre 2026</p>
      <div class="m-grid num">
        {#each ["L", "M", "X", "J", "V", "S", "D"] as d}<span class="m-h">{d}</span>{/each}
        {#each month as d}<span class:today={d === 22} class:has={[22, 23, 24, 26].includes(d)} class:clash={d === 23}>{d ?? ""}</span>{/each}
      </div>
    </div>
    <nav class="lnav">
      <button class:on={view === "hoy"} onclick={() => go("hoy")}><Icon name="today" size={18} />Hoy</button>
      <button class:on={view === "pendientes"} onclick={() => go("pendientes")}><Icon name="inbox" size={18} />Pendientes<span class="num c">3</span></button>
    </nav>
    <div class="accts">{#each Object.values(accounts) as a}<AccountTag id={a.id} />{/each}</div>
  </aside>

  <main class="main">
    <button class="cmd-top" onclick={() => go("busqueda")}><Icon name="search" size={18} /><span>Busca o apunta algo</span><kbd>Ctrl K</kbd></button>
    {#if view === "pendientes"}
      <Backlog />
    {:else}
      <DayHeader inline />
      <ol class="ticker" aria-label="Próximos siete días">
        {#each ticker as [d, n, s], i}
          <li class:today={i === 0}>
            <span class="tw">{d}</span><span class="tn num">{n}</span><span class="ts" class:clash={n === 23}>{n === 23 ? "Conflicto" : i === 0 && ui.estado === "vacio" ? "Libre" : s}</span>
          </li>
        {/each}
      </ol>

      {#if ui.estado === "error"}<div class="gap"><States kind="error" /></div>{/if}
      {#if ui.estado === "cargando"}
        <div class="gap"><States kind="cargando" rows={4} /></div>
      {:else if ui.estado === "vacio"}
        <States kind="vacio" />
      {:else}
        <div class="gap"><NextCard size="lg" /></div>
        <Section title="Después, hoy">
          <ul>{#each later as e}<EventRow event={e} />{/each}{#each tasksToday as t}<TaskRow task={t} />{/each}</ul>
        </Section>
        <button class="summary" aria-expanded={showAttention} onclick={() => (showAttention = !showAttention)}>
          <span class="s-dot" aria-hidden="true"></span>
          <span><strong>Pide atención:</strong> {attention[0].title.toLowerCase()} y 1 más</span>
          <Icon name="down" size={16} />
        </button>
        {#if showAttention}<Attention />{/if}
        <p class="done-line"><Icon name="check" size={15} />{done.length} cosas hechas hoy</p>
      {/if}
    {/if}
  </main>

  <aside class="right" aria-label="Próximos días">
    {#if view === "hoy"}<Section title="Próximos días"><Upcoming /></Section>{/if}
  </aside>

  <div class="dock">
    <button class="cmd" onclick={() => go("busqueda")}><Icon name="search" size={19} /><span>Busca o apunta algo</span></button>
    <button class="add" aria-label="Apuntar algo" onclick={() => go("captura")}><Icon name="plus" size={22} /></button>
  </div>
</div>

<style>
  .left, .right, .cmd-top { display: none; }
  .main { max-width: 640px; margin: 0 auto; padding: var(--s4) var(--s4) calc(110px + env(safe-area-inset-bottom)); }
  .gap { margin-top: var(--s5); }

  .ticker { list-style: none; margin: var(--s4) calc(var(--s4) * -1) 0; padding: 0 var(--s4); display: flex; gap: var(--s2); overflow-x: auto; scrollbar-width: none; }
  .ticker li { flex: none; width: 74px; display: grid; gap: 1px; padding: 10px 12px; border-radius: 16px; background: var(--surface-1); border: 1px solid var(--line); }
  .ticker li.today { background: var(--text); color: var(--bg); border-color: transparent; }
  .tw { font-size: 11.5px; font-weight: var(--w-medium); opacity: .7; }
  .tn { font-size: 20px; font-weight: var(--w-strong); }
  .ts { font-size: 11px; color: var(--text-3); white-space: nowrap; }
  .today .ts { color: color-mix(in srgb, var(--bg) 70%, transparent); }
  .ts.clash { color: var(--danger); font-weight: var(--w-strong); }

  .summary { margin-top: var(--s6); width: 100%; display: flex; align-items: center; gap: var(--s3); min-height: 52px; padding: 0 var(--s4); border-radius: var(--r-row); border: 1px solid var(--line); background: none; text-align: left; font-size: var(--fs-meta); color: var(--text-2); }
  .summary strong { color: var(--text); font-weight: var(--w-medium); }
  .summary :global(svg) { margin-left: auto; color: var(--text-3); flex: none; }
  .s-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--attention); flex: none; }
  .done-line { margin: var(--s5) var(--s2) 0; display: flex; gap: var(--s2); align-items: center; font-size: var(--fs-meta); color: var(--text-3); }

  .dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; gap: var(--s2); padding: var(--s3) var(--s3) calc(var(--s3) + env(safe-area-inset-bottom)); background: linear-gradient(to top, var(--bg) 60%, transparent); }
  .cmd { flex: 1; display: flex; align-items: center; gap: var(--s3); min-height: 54px; padding: 0 var(--s5); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: color-mix(in srgb, var(--surface-2) 88%, transparent); backdrop-filter: blur(16px); color: var(--text-3); font-size: 16px; box-shadow: 0 10px 30px -12px rgb(0 0 0 / .5); }
  .add { width: 54px; height: 54px; border-radius: 50%; border: 0; background: var(--accent-grad); color: var(--accent-ink); display: grid; place-items: center; flex: none; }

  @media (min-width: 1024px) {
    .dock { display: none; }
    .shell { display: grid; grid-template-columns: 280px minmax(0, 1fr) 380px; min-height: 100dvh; }
    .left { display: flex; flex-direction: column; gap: var(--s6); padding: var(--s6) var(--s5); border-right: 1px solid var(--line); position: sticky; top: 0; height: 100dvh; }
    .right { display: block; padding: 92px var(--s6) 0; border-left: 1px solid var(--line); }
    .right :global(.section) { margin-top: 0; }
    .main { max-width: 680px; width: 100%; padding: var(--s6) var(--s8) var(--s10); }
    .cmd-top { display: flex; align-items: center; gap: var(--s3); width: 100%; min-height: 44px; padding: 0 var(--s4); margin-bottom: var(--s6); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: var(--surface-1); color: var(--text-3); text-align: left; }
    .cmd-top kbd { margin-left: auto; font: inherit; font-size: 11px; }
    .ticker { margin: var(--s4) 0 0; padding: 0; }
    .ticker li { width: auto; flex: 1; }
    .brand { margin: 0; font-weight: var(--w-strong); }
    .m-t { margin: 0 0 var(--s3); font-weight: var(--w-strong); font-size: var(--fs-meta); }
    .m-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; font-size: 12.5px; text-align: center; }
    .m-grid span { height: 30px; display: grid; place-items: center; border-radius: 50%; position: relative; color: var(--text-2); }
    .m-h { color: var(--text-3) !important; font-weight: var(--w-medium); font-size: 11px; }
    .m-grid .has::after { content: ""; position: absolute; bottom: 3px; width: 4px; height: 4px; border-radius: 50%; background: var(--text-3); }
    .m-grid .clash::after { background: var(--danger); }
    .m-grid .today { background: var(--accent-grad); color: var(--accent-ink); font-weight: var(--w-strong); }
    .m-grid .today::after { background: var(--accent-ink); }
    .lnav { display: grid; gap: 2px; }
    .lnav button { display: flex; align-items: center; gap: var(--s3); min-height: 40px; padding: 0 var(--s3); border-radius: var(--r-chip); border: 0; background: none; color: var(--text-2); font-weight: var(--w-medium); }
    .lnav button.on { background: var(--surface-3); color: var(--text); }
    .lnav .c { margin-left: auto; color: var(--text-3); font-size: var(--fs-small); }
    .accts { margin-top: auto; display: grid; gap: var(--s2); }
  }
</style>
