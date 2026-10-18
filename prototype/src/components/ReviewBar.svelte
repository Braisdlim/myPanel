<script>
  // Controles de revisión: no forman parte del diseño. Se ocultan con ?bare.
  import Icon from "./Icon.svelte";
  import { ui, COMPOSITIONS, SCREENS, STATES, go } from "../lib/ui.svelte.js";
  let open = $state(false);
</script>

<div class="review" class:open>
  <button class="toggle" aria-expanded={open} onclick={() => (open = !open)}>
    <Icon name="sliders" size={16} /><span>{open ? "Cerrar" : "Revisión"}</span>
  </button>
  {#if open}
    <div class="panel" role="region" aria-label="Controles de revisión del prototipo">
      <label>Composición
        <select bind:value={ui.comp}>{#each COMPOSITIONS as c}<option value={c.id}>{c.name}</option>{/each}</select>
      </label>
      <label>Pantalla
        <select value={ui.screen} onchange={(e) => go(e.currentTarget.value)}>{#each SCREENS as s}<option value={s.id}>{s.name}</option>{/each}</select>
      </label>
      <label>Estado
        <select bind:value={ui.estado}>{#each STATES as s}<option value={s.id}>{s.name}</option>{/each}</select>
      </label>
      <label>Tema
        <select bind:value={ui.theme}><option value="system">Sistema</option><option value="dark">Oscuro</option><option value="light">Claro</option></select>
      </label>
      <label>Tipografía
        <select bind:value={ui.font}><option value="figtree">Figtree</option><option value="onest">Onest</option><option value="system">Del sistema</option></select>
      </label>
      <p class="note">Datos ficticios. Jueves 22 de octubre de 2026, 16:10.</p>
    </div>
  {/if}
</div>

<style>
  .review { position: fixed; top: max(10px, env(safe-area-inset-top)); right: 10px; z-index: 60; font-size: 13px; }
  .toggle { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1px dashed #8a8f99; background: rgb(20 22 28 / .86); color: #f1f2f4; font-weight: 600; backdrop-filter: blur(10px); }
  .panel { margin-top: 8px; width: 250px; display: grid; gap: 10px; padding: 14px; border-radius: 14px; border: 1px dashed #8a8f99; background: rgb(20 22 28 / .94); color: #f1f2f4; backdrop-filter: blur(10px); }
  label { display: grid; gap: 4px; font-weight: 600; font-size: 12px; color: #b9bdc6; }
  select { min-height: 36px; border-radius: 8px; border: 1px solid #3a3e48; background: #1d2027; color: #f1f2f4; padding: 0 8px; font-size: 14px; }
  .note { margin: 0; font-size: 11.5px; color: #9aa0aa; }
</style>
