<script>
  let { bare = false } = $props();
  import { backlog, freeSlots } from "../data/demo.js";
  import { showToast } from "../lib/ui.svelte.js";
</script>

<div class="backlog">
  {#if !bare}
    <h1>Pendientes</h1>
    <p class="lead">Cosas apuntadas sin fecha. Elige cuándo hacerlas o déjalas aquí.</p>
  {/if}
  <ul>
    {#each backlog as b, i}
      <li>
        <span class="t">{b.title}</span>
        <span class="age">Apuntado {b.age}</span>
        {#if i === 0}
          <p class="prop">Propuesta: hoy, <span class="num">{freeSlots[1].label}</span>. {freeSlots[1].why}.</p>
          <div class="acts">
            <button class="primary" onclick={() => showToast("Aceptado: hoy de 18:30 a 18:45")}>Aceptar</button>
            <button class="ghost" onclick={() => showToast("Pospuesto una semana")}>Posponer</button>
            <button class="ghost" onclick={() => showToast("Se queda en Pendientes")}>Dejar pendiente</button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  h1 { margin: 0; padding: var(--s2) var(--s2) 0; font-size: var(--fs-display); line-height: var(--lh-display); font-weight: var(--w-strong); letter-spacing: -.02em; }
  .lead { margin: var(--s2) var(--s2) var(--s6); color: var(--text-2); }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  li { display: grid; gap: 2px; padding: var(--s3) var(--s3); border-radius: var(--r-row); }
  li:first-child { background: var(--surface-3); border: 1px solid var(--line); }
  .t { font-weight: var(--w-medium); }
  .age { font-size: var(--fs-meta); color: var(--text-3); }
  .prop { margin: var(--s3) 0 0; font-size: var(--fs-meta); color: var(--text-2); }
  .acts { display: flex; gap: var(--s2); margin-top: var(--s3); flex-wrap: wrap; }
  .primary { min-height: 40px; padding: 0 var(--s4); border: 0; border-radius: var(--r-pill); background: var(--accent-grad); color: var(--accent-ink); font-weight: var(--w-strong); }
  .ghost { min-height: 40px; padding: 0 var(--s3); border: 0; background: none; color: var(--text-2); font-weight: var(--w-medium); }
</style>
