<script>
  import Icon from "./Icon.svelte";
  import { ui, toggleDone } from "../lib/ui.svelte.js";

  let { task, doneAt = null } = $props();
  const checked = $derived(doneAt !== null || ui.completed.includes(task.id));
</script>

<li class="row" class:checked>
  <button
    class="check"
    role="checkbox"
    aria-checked={checked}
    aria-label={checked ? `Marcar «${task.title}» como pendiente` : `Completar «${task.title}»`}
    onclick={() => doneAt === null && toggleDone(task.id)}
    disabled={doneAt !== null}
  >
    <span class="circle">{#if checked}<Icon name="check" size={14} />{/if}</span>
  </button>
  <span class="body">
    <span class="title">{task.title}</span>
    {#if doneAt}
      <span class="meta num">A las {doneAt}</span>
    {:else if task.estimate || task.due}
      <span class="meta">{task.estimate ?? ""}{task.estimate && task.due ? ", " : ""}{task.due ?? ""}</span>
    {/if}
  </span>
</li>

<style>
  .row { list-style: none; display: grid; grid-template-columns: 48px 1fr; align-items: center; min-height: var(--tap); padding-right: var(--s3); }
  .check {
    width: 48px; height: 48px; display: grid; place-items: center;
    background: none; border: 0; padding: 0; border-radius: 50%;
  }
  .check:disabled { cursor: default; }
  .circle {
    width: 22px; height: 22px; border-radius: 50%;
    border: 1.6px solid var(--text-3);
    display: grid; place-items: center;
    color: var(--accent-ink);
    transition: background var(--t-med) var(--ease-out), border-color var(--t-med) var(--ease-out), transform var(--t-med) var(--ease-spring);
  }
  .check:not(:disabled):hover .circle { border-color: var(--text-2); }
  .check:active .circle { transform: scale(.88); }
  .checked .circle { background: var(--ok); border-color: var(--ok); color: var(--bg); }
  .body { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; min-width: 0; }
  .title { font-weight: var(--w-regular); transition: color var(--t-med) var(--ease-out); }
  .checked .title { color: var(--text-3); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--text-3) 60%, transparent); }
  .meta { font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-3); }
</style>
