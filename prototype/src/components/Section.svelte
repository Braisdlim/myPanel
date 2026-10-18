<script>
  import Icon from "./Icon.svelte";
  let { title, count = null, collapsible = false, startOpen = true, children, extra = null } = $props();
  let open = $state(startOpen);
</script>

<section class="section">
  <header>
    {#if collapsible}
      <button class="toggle" aria-expanded={open} onclick={() => (open = !open)}>
        <h3>{title}{#if count !== null}<span class="count num">{count}</span>{/if}</h3>
        <span class="chev" class:open aria-hidden="true"><Icon name="down" size={16} /></span>
      </button>
    {:else}
      <h3>{title}{#if count !== null}<span class="count num">{count}</span>{/if}</h3>
    {/if}
    {#if extra}{@render extra()}{/if}
  </header>
  {#if open}{@render children()}{/if}
</section>

<style>
  .section { margin-top: var(--s6); }
  header { display: flex; justify-content: space-between; align-items: center; padding: 0 var(--s2); min-height: 32px; }
  h3 { margin: 0; font-size: var(--fs-meta); line-height: var(--lh-meta); font-weight: 650; color: var(--text-2); display: flex; align-items: center; gap: var(--s2); }
  .count { font-weight: 560; color: var(--text-3); }
  .toggle { display: flex; align-items: center; gap: var(--s2); background: none; border: 0; padding: 0; min-height: 40px; color: inherit; }
  .chev { color: var(--text-3); display: inline-flex; transform: rotate(-90deg); transition: transform var(--t-med) var(--ease-out); }
  .chev.open { transform: none; }
  :global(.section ul) { margin: var(--s1) 0 0; padding: 0; }
</style>
