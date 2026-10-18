<script>
  import Icon from "./Icon.svelte";
  import { backlog } from "../data/demo.js";
  import { showToast } from "../lib/ui.svelte.js";
  let { kind, rows = 4 } = $props();
</script>

{#if kind === "cargando"}
  <div class="skeleton" role="status" aria-label="Cargando tu día">
    {#each Array(rows) as _, i}
      <div class="sk-row" style={`--d:${i * 90}ms`}>
        <span class="sk sk-time"></span>
        <span class="sk-body"><span class="sk sk-title" style={`width:${[72, 54, 64, 46][i % 4]}%`}></span><span class="sk sk-meta"></span></span>
      </div>
    {/each}
  </div>
{:else if kind === "error"}
  <div class="banner" role="alert">
    <span class="ic"><Icon name="alert" size={18} /></span>
    <div>
      <p class="b-title">No se pudo actualizar la cuenta Secundaria</p>
      <p class="b-text">El permiso caducó. Lo que ves de esa cuenta es de ayer a las 22:40.</p>
      <div class="b-actions">
        <button class="primary" onclick={() => showToast("En la app real se abriría Google para reconectar")}>Reconectar</button>
        <button class="ghost">Más tarde</button>
      </div>
    </div>
  </div>
{:else if kind === "vacio"}
  <div class="empty">
    <span class="e-ic"><Icon name="sun" size={26} /></span>
    <p class="e-title">Nada en la agenda hoy</p>
    <p class="e-text">Tienes el día libre. Si te apetece, hay algo pendiente que encaja:</p>
    <div class="suggest">
      <span>{backlog[0].title}</span>
      <button class="primary" onclick={() => showToast("Propuesta: hoy de 11:00 a 11:15")}>Hacerlo hoy</button>
    </div>
  </div>
{/if}

<style>
  .skeleton { display: grid; gap: var(--s2); padding: var(--s2) 0; }
  .sk-row { display: grid; grid-template-columns: 52px 1fr; gap: var(--s3); padding: 10px var(--s2); }
  .sk-body { display: grid; gap: 8px; }
  .sk { display: block; height: 12px; border-radius: 6px; background: var(--surface-3); animation: shimmer 1.4s var(--d) infinite ease-in-out; }
  .sk-time { width: 40px; height: 14px; }
  .sk-title { height: 14px; }
  .sk-meta { width: 30%; }
  @keyframes shimmer { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .sk { animation: none; } }

  .banner { display: grid; grid-template-columns: 28px 1fr; gap: var(--s3); padding: var(--s4); border-radius: var(--r-card); background: var(--danger-soft); border: 1px solid color-mix(in srgb, var(--danger) 25%, transparent); }
  .ic { color: var(--danger); padding-top: 1px; }
  .b-title { margin: 0; font-weight: 620; }
  .b-text { margin: var(--s1) 0 0; font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
  .b-actions { display: flex; gap: var(--s3); margin-top: var(--s3); }

  .empty { text-align: left; padding: var(--s8) var(--s2) var(--s4); }
  .e-ic { color: var(--accent-text); display: inline-flex; }
  .e-title { margin: var(--s3) 0 0; font-size: var(--fs-title); line-height: var(--lh-title); font-weight: 650; }
  .e-text { margin: var(--s2) 0 0; color: var(--text-2); max-width: 40ch; }
  .suggest { margin-top: var(--s4); display: flex; justify-content: space-between; align-items: center; gap: var(--s3); padding: var(--s3) var(--s3) var(--s3) var(--s4); border-radius: var(--r-row); background: var(--surface-1); border: 1px solid var(--line); }

  .primary { min-height: 40px; padding: 0 var(--s4); border: 0; border-radius: var(--r-pill); background: var(--accent); color: var(--accent-ink); font-weight: 650; white-space: nowrap; }
  .ghost { min-height: 40px; padding: 0 var(--s3); border: 0; background: none; font-weight: 600; color: var(--text-2); }
</style>
