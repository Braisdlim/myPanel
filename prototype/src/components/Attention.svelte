<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { attention } from "../data/demo.js";
  import { showToast } from "../lib/ui.svelte.js";
</script>

<ul class="list">
  {#each attention as a}
    <li class="item">
      <span class="ic" aria-hidden="true"><Icon name={a.kind === "correo" ? "mail" : "inbox"} size={17} /></span>
      <span class="body">
        <span class="title">{a.title}</span>
        <span class="meta">{a.detail}{#if a.account}<AccountTag id={a.account} />{/if}</span>
      </span>
      <button class="act" onclick={() => showToast(a.kind === "correo" ? "Se abriría el correo en Gmail" : "Propuesta: hoy de 18:30 a 18:45")}>{a.action}</button>
    </li>
  {/each}
</ul>

<style>
  .list { list-style: none; margin: var(--s1) 0 0; padding: 0; display: grid; }
  .item { display: grid; grid-template-columns: 36px 1fr auto; gap: var(--s2); align-items: center; padding: 8px var(--s2) 8px var(--s1); min-height: var(--tap); }
  .ic { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 10px; color: var(--attention); background: color-mix(in srgb, var(--attention) 13%, transparent); }
  .body { display: grid; gap: 2px; min-width: 0; }
  .title { font-weight: 520; }
  .meta { display: flex; gap: var(--s3); align-items: center; flex-wrap: wrap; font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-3); }
  .act { min-height: 36px; padding: 0 var(--s3); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: none; font-size: var(--fs-meta); font-weight: 620; color: var(--text); white-space: nowrap; }
  .act:hover { background: var(--surface-1); }
</style>
