<script>
  import Icon from "../Icon.svelte";
  import AccountTag from "../AccountTag.svelte";
  import { accounts } from "../../data/demo.js";
  import { ui, go } from "../../lib/ui.svelte.js";

  let { children } = $props();
  const view = $derived(ui.screen === "captura" ? "hoy" : ui.screen);
  const main = [
    { id: "hoy", name: "Hoy", icon: "home" },
    { id: "planificar", name: "Planificar", icon: "plan" },
    { id: "pendientes", name: "Pendientes", icon: "inbox", count: 3 },
    { id: "busqueda", name: "Buscar", icon: "search" },
  ];
</script>

<div class="shell">
  <aside class="side" aria-label="Navegación">
    <div class="brand"><span class="mark" aria-hidden="true"></span><span>myPanel</span></div>
    <button class="find" onclick={() => go("busqueda")}><Icon name="search" size={16} /><span>Buscar</span><kbd>Ctrl K</kbd></button>

    <nav aria-label="Principal">
      <p class="group">Principal</p>
      {#each main as n}
        <button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}>
          <Icon name={n.icon} size={18} />{n.name}{#if n.count}<span class="count num">{n.count}</span>{/if}
        </button>
      {/each}
    </nav>
    <nav aria-label="Tú">
      <p class="group">Tú</p>
      <button disabled title="Llegará en la fase 3"><Icon name="brain" size={18} />Lo que sé de ti<span class="soon">Fase 3</span></button>
      <button class:on={view === "sistema"} onclick={() => go("sistema")}><Icon name="layers" size={18} />Sistema de diseño</button>
    </nav>
    <div class="accts">
      <p class="group">Cuentas conectadas</p>
      {#each Object.values(accounts) as a}
        <div class="acct"><AccountTag id={a.id} /><small>{a.email}</small></div>
      {/each}
    </div>
  </aside>

  <main class="content">{@render children()}</main>

  <nav class="dock" aria-label="Secciones">
    {#each main.slice(0, 2) as n}
      <button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}><Icon name={n.icon} size={21} /><span>{n.name}</span></button>
    {/each}
    <button class="add" aria-label="Apuntar algo" onclick={() => go("captura")}><Icon name="plus" size={24} /></button>
    {#each main.slice(2) as n}
      <button class:on={view === n.id} aria-current={view === n.id ? "page" : undefined} onclick={() => go(n.id)}><Icon name={n.icon} size={21} /><span>{n.name}</span></button>
    {/each}
  </nav>
</div>

<style>
  .side { display: none; }
  .content { max-width: 640px; margin: 0 auto; padding: var(--s5) var(--s4) calc(120px + env(safe-area-inset-bottom)); }

  .dock {
    position: fixed; z-index: 20;
    left: max(12px, env(safe-area-inset-left)); right: max(12px, env(safe-area-inset-right));
    bottom: calc(12px + env(safe-area-inset-bottom));
    display: grid; grid-template-columns: 1fr 1fr 64px 1fr 1fr; align-items: center;
    height: 68px; padding: 0 6px; border-radius: 26px;
    background: color-mix(in srgb, var(--surface-2) 78%, transparent);
    backdrop-filter: blur(22px) saturate(1.5);
    border: 1px solid var(--line-strong);
    box-shadow: 0 18px 40px -16px rgb(0 0 0 / .55);
  }
  .dock button:not(.add) { height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: 0; background: none; color: var(--text-3); font-size: 11px; font-weight: var(--w-medium); border-radius: 18px; }
  .dock button.on { color: var(--text); }
  .dock button.on :global(svg) { color: var(--accent-text); }
  .add { justify-self: center; width: 52px; height: 52px; border-radius: 18px; border: 0; background: var(--accent-grad); color: var(--accent-ink); display: grid; place-items: center; box-shadow: 0 10px 26px -8px color-mix(in srgb, var(--accent) 70%, transparent); transition: transform var(--t-fast) var(--ease-spring); }
  .add:active { transform: scale(.93); }

  @media (min-width: 1024px) {
    .dock { display: none; }
    .shell { display: grid; grid-template-columns: 264px minmax(0, 1fr); min-height: 100dvh; }
    .side { display: flex; flex-direction: column; gap: var(--s5); position: sticky; top: 0; height: 100dvh; overflow: auto; padding: var(--s5) var(--s4); border-right: 1px solid var(--line); background: color-mix(in srgb, var(--surface-1) 60%, transparent); }
    .content { max-width: 1240px; width: 100%; padding: var(--s6) var(--s8) var(--s10); }
    .brand { display: flex; align-items: center; gap: var(--s3); padding: var(--s2); font-size: 17px; font-weight: var(--w-medium); }
    .mark { width: 30px; height: 30px; border-radius: 10px; background: var(--accent-grad); box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--accent) 70%, transparent); position: relative; }
    .mark::before { content: ""; position: absolute; inset: 7px; border-radius: 50%; border: 2px solid var(--accent-ink); opacity: .85; }
    .mark::after { content: ""; position: absolute; left: 14px; top: 10px; width: 2px; height: 6px; border-radius: 1px; background: var(--accent-ink); }
    .find { display: flex; align-items: center; gap: var(--s2); min-height: 42px; padding: 0 var(--s3); border-radius: var(--r-row); border: 1px solid var(--line); background: var(--surface-1); color: var(--text-3); font-size: var(--fs-meta); }
    .find kbd { margin-left: auto; font: inherit; font-size: 11px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--line-strong); }
    nav { display: grid; gap: 2px; }
    .group { margin: 0 0 var(--s1); padding: 0 var(--s3); font-size: var(--fs-small); color: var(--text-3); }
    nav button { display: flex; align-items: center; gap: var(--s3); min-height: 40px; padding: 0 var(--s3); border-radius: var(--r-row); border: 1px solid transparent; background: none; color: var(--text-2); font-size: 14.5px; text-align: left; }
    nav button:hover:not(:disabled) { background: var(--surface-1); color: var(--text); }
    nav button.on { background: var(--surface-3); border-color: var(--line); color: var(--text); }
    nav button.on :global(svg) { color: var(--accent-text); }
    nav button:disabled { opacity: .55; cursor: default; }
    .count { margin-left: auto; font-size: var(--fs-small); color: var(--text-3); }
    .soon { margin-left: auto; font-size: 10.5px; padding: 2px 6px; border-radius: 6px; background: var(--surface-3); color: var(--text-3); }
    .accts { margin-top: auto; display: grid; gap: var(--s3); padding: var(--s3); border-radius: var(--r-row); background: var(--surface-1); border: 1px solid var(--line); }
    .accts .group { padding: 0; }
    .acct { display: grid; gap: 2px; }
    .acct small { font-size: 11.5px; color: var(--text-3); padding-left: 13px; overflow: hidden; text-overflow: ellipsis; }
  }
</style>
