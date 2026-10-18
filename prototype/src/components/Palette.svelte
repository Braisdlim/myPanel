<script>
  // Paleta de C: un solo lugar para apuntar o buscar, con el modo siempre visible.
  import Capture from "./Capture.svelte";
  import Search from "./Search.svelte";
  import { go } from "../lib/ui.svelte.js";
  let { mode = "buscar", initial = "" } = $props();
  let current = $state(mode);
</script>

<div class="palette">
  <div class="modes" role="tablist" aria-label="Modo">
    <button role="tab" aria-selected={current === "apuntar"} class:on={current === "apuntar"} onclick={() => (current = "apuntar")}>Apuntar</button>
    <button role="tab" aria-selected={current === "buscar"} class:on={current === "buscar"} onclick={() => (current = "buscar")}>Buscar</button>
  </div>
  {#if current === "apuntar"}
    <Capture variant="c" {initial} onsaved={() => go("hoy")} />
  {:else}
    <Search compact />
  {/if}
</div>

<style>
  .palette { display: grid; gap: var(--s4); padding-right: 44px; }
  .modes { display: inline-grid; grid-template-columns: 1fr 1fr; justify-self: start; padding: 3px; border-radius: var(--r-pill); background: var(--surface-3); }
  .modes button { min-height: 36px; padding: 0 var(--s5); border-radius: var(--r-pill); border: 0; background: none; font-weight: var(--w-medium); color: var(--text-2); font-size: var(--fs-meta); }
  .modes button.on { background: var(--text); color: var(--bg); }
  .palette :global(.capture), .palette :global(.search) { margin-right: -44px; }
</style>
