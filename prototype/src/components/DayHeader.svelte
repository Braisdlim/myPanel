<script>
  import Icon from "./Icon.svelte";
  import { today } from "../data/demo.js";
  import { ui } from "../lib/ui.svelte.js";
  let { inline = false } = $props();
</script>

<header class="dh" class:inline>
  <h1>
    {#if inline}
      {today.weekday}, {today.day} de {today.month}
    {:else}
      <span class="wd">{today.weekday} {today.day}</span><span class="mo">{today.month}</span>
    {/if}
  </h1>
  <p class="sync" role="status">
    {#if ui.estado === "cargando"}
      <span class="spin" aria-hidden="true"></span>Actualizando
    {:else if ui.estado === "error"}
      <Icon name="alert" size={14} />Una cuenta sin actualizar
    {:else}
      Al día
    {/if}
  </p>
</header>

<style>
  .dh { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--s3); padding: var(--s2) var(--s2) 0; }
  h1 { margin: 0; display: flex; flex-direction: column; font-size: var(--fs-display); line-height: var(--lh-display); font-weight: 720; letter-spacing: -.02em; }
  .mo { font-size: var(--fs-title); line-height: var(--lh-title); font-weight: 520; color: var(--text-3); letter-spacing: 0; }
  .inline h1 { font-size: var(--fs-title); line-height: var(--lh-title); font-weight: 650; letter-spacing: 0; }
  .sync { margin: 0 0 4px; display: inline-flex; gap: 6px; align-items: center; font-size: var(--fs-small); color: var(--text-3); white-space: nowrap; }
  .spin { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--line-strong); border-top-color: var(--accent); animation: spin .9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
