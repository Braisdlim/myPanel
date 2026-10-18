<script>
  import { onMount } from "svelte";
  import Icon from "./Icon.svelte";

  // variant: "sheet" (hoja inferior en móvil, diálogo en escritorio) | "palette" (paleta de comandos)
  let { label, title = null, onclose, variant = "sheet", children } = $props();
  let panel;

  onMount(() => {
    const prev = document.activeElement;
    const first = (panel.querySelector("textarea, input:not([type=radio])") ?? panel);
    first?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && onclose();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev?.focus?.(); };
  });
</script>

<div class="layer {variant}">
  <button class="scrim" aria-label="Cerrar" tabindex="-1" onclick={onclose}></button>
  <div class="panel" tabindex="-1" role="dialog" aria-modal="true" aria-label={label} bind:this={panel}>
    <span class="grabber" aria-hidden="true"></span>
    <div class="head" class:floating={!title}>
      {#if title}<h2 class="title">{title}</h2>{/if}
      <button class="close" aria-label="Cerrar" onclick={onclose}><Icon name="x" size={18} /></button>
    </div>
    {@render children()}
  </div>
</div>

<style>
  .layer { position: fixed; inset: 0; z-index: 40; display: flex; align-items: flex-end; justify-content: center; }
  .scrim { position: absolute; inset: 0; border: 0; background: var(--scrim); backdrop-filter: blur(2px); animation: fade var(--t-med) var(--ease-out); }
  .panel {
    position: relative;
    width: 100%;
    max-height: 88dvh;
    overflow: auto;
    padding: var(--s3) var(--s5) calc(var(--s6) + env(safe-area-inset-bottom));
    background: var(--surface-2);
    border-radius: var(--r-sheet) var(--r-sheet) 0 0;
    box-shadow: var(--shadow-sheet);
    animation: up var(--t-slow) var(--ease-out);
  }
  .panel:focus { outline: none; }
  .grabber { display: block; width: 36px; height: 5px; border-radius: 3px; background: var(--line-strong); margin: 0 auto var(--s3); }
  .head { display: flex; align-items: center; justify-content: space-between; gap: var(--s3); min-height: 40px; margin-bottom: var(--s2); }
  .head.floating { position: absolute; top: var(--s5); right: var(--s4); margin: 0; z-index: 1; }
  .title { margin: 0; font-size: var(--fs-title); line-height: var(--lh-title); font-weight: 680; }
  .close { margin-left: auto; width: 40px; height: 40px; border-radius: 50%; border: 0; background: var(--surface-3); color: var(--text-2); display: grid; place-items: center; }

  @media (min-width: 1024px) {
    .layer { align-items: center; }
    .layer.palette { align-items: flex-start; padding-top: 14vh; }
    .panel { width: min(600px, 92vw); border-radius: var(--r-sheet); padding: var(--s6); animation: pop var(--t-med) var(--ease-out); }
    .grabber { display: none; }
  }

  @keyframes up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes pop { from { transform: scale(.98) translateY(6px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes fade { from { opacity: 0; } }
</style>
