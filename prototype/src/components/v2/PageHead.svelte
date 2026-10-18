<script>
  import Icon from "../Icon.svelte";
  import { ui, go } from "../../lib/ui.svelte.js";
  let { title, subtitle = null, actions = true } = $props();
</script>

<header class="ph">
  <div class="tx">
    <h1>{title}</h1>
    {#if subtitle}
      <p>
        {subtitle}
        {#if ui.estado === "cargando"}<span class="st"><span class="spin" aria-hidden="true"></span>Actualizando</span>
        {:else if ui.estado === "error"}<span class="st warn"><Icon name="alert" size={13} />Una cuenta sin actualizar</span>{/if}
      </p>
    {/if}
  </div>
  {#if actions}
    <div class="acts">
      <button class="ghost" onclick={() => go("busqueda")}><Icon name="search" size={16} />Buscar<kbd>Ctrl K</kbd></button>
      <button class="primary" onclick={() => go("captura")}><Icon name="plus" size={17} />Apuntar algo</button>
    </div>
  {/if}
</header>

<style>
  .ph { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--s4); flex-wrap: wrap; padding: var(--s2) var(--s1) 0; margin-bottom: var(--s6); }
  h1 { margin: 0; font-size: var(--fs-hero); line-height: var(--lh-hero); font-weight: var(--w-regular); letter-spacing: -.025em; }
  p { margin: var(--s1) 0 0; display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; color: var(--text-2); font-size: 15px; }
  .st { display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-small); color: var(--text-3); }
  .st.warn { color: var(--attention); }
  .spin { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--line-strong); border-top-color: var(--accent); animation: spin .9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .acts { display: none; gap: var(--s2); }
  .acts button { display: inline-flex; align-items: center; gap: var(--s2); min-height: 44px; padding: 0 var(--s4); border-radius: var(--r-pill); font-size: 14.5px; font-weight: var(--w-medium); }
  .ghost { border: 1px solid var(--line-strong); background: var(--surface-1); color: var(--text-2); }
  .ghost kbd { font: inherit; font-size: 11px; color: var(--text-3); }
  .primary { border: 0; background: var(--accent-grad); color: var(--accent-ink); box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--accent) 70%, transparent); }
  @media (min-width: 1024px) { .acts { display: flex; } }
</style>
