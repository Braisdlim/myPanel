<script>
  import Icon from "../Icon.svelte";
  // Tarjeta de cristal: título a la izquierda, una acción opcional a la derecha.
  let { title = null, subtitle = null, action = null, actionLabel = "Abrir", onaction = null, hero = false, flush = false, children, extra = null, cls = "" } = $props();
</script>

<section class="card {cls}" class:hero class:flush>
  {#if title || action}
    <header>
      <div class="ht">
        {#if title}<h2>{title}</h2>{/if}
        {#if subtitle}<p>{subtitle}</p>{/if}
      </div>
      {#if extra}{@render extra()}{/if}
      {#if action}
        <button class="ib" aria-label={actionLabel} title={actionLabel} onclick={onaction}><Icon name={action} size={17} /></button>
      {/if}
    </header>
  {/if}
  {@render children()}
</section>

<style>
  .card {
    position: relative;
    min-width: 0;
    container-type: inline-size;
    padding: var(--s5);
    border-radius: var(--r-card);
    background: var(--card-highlight), var(--surface-1);
    border: 1px solid var(--line);
    box-shadow: var(--shadow-card);
  }
  .card.flush { padding: var(--s3) var(--s3) var(--s2); }
  .card.flush header { padding: var(--s2) var(--s2) 0; }
  .hero { background: var(--card-highlight), var(--hero-fill); box-shadow: var(--shadow-hero); border-color: var(--line-strong); overflow: hidden; isolation: isolate; }
  .hero::before { content: ""; position: absolute; width: 70%; aspect-ratio: 1; right: -18%; top: -55%; background: radial-gradient(closest-side, var(--accent-soft), transparent); z-index: -1; }
  header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s3); margin-bottom: var(--s3); }
  .ht { min-width: 0; }
  h2 { margin: 0; font-size: 15.5px; line-height: 22px; font-weight: var(--w-medium); letter-spacing: 0; }
  .ht p { margin: 2px 0 0; font-size: var(--fs-small); line-height: var(--lh-small); color: var(--text-3); }
  .ib { flex: none; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--surface-3); color: var(--text-2); transition: color var(--t-fast), background var(--t-fast); }
  .ib:hover { color: var(--text); }
</style>
