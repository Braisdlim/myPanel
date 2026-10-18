<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { upcoming, vacation } from "../data/demo.js";
  import { ui } from "../lib/ui.svelte.js";
</script>

<ol class="days">
  {#each upcoming as d}
    <li class="day" class:free={!d.items.length}>
      <span class="date"><span class="wd">{d.day}</span><span class="dn num">{d.date}</span></span>
      <span class="items">
        {#if !d.items.length}
          <span class="nothing">Libre</span>
        {:else}
          {#each d.items as it}
            <span class="it" class:clash={it.conflict}>
              <span class="t num">{it.time}</span>
              <span class="n">{it.title}</span>
              {#if it.kind === "rutina"}<span class="opt" title="Rutina opcional"><Icon name="repeat" size={13} /><span class="sr-only">Opcional</span></span>{/if}
              <AccountTag id={it.account} compact />
            </span>
          {/each}
          {#if d.items.some((i) => i.conflict)}
            <button class="clash-btn" onclick={() => (ui.estado = "conflicto")}>
              <Icon name="alert" size={14} />Se solapan. Ver opciones
            </button>
          {/if}
        {/if}
      </span>
    </li>
  {/each}
</ol>
<p class="later">
  <Icon name="calendar" size={15} />
  <span><strong>{vacation.title}</strong>, {vacation.range}. {vacation.note}</span>
</p>

<style>
  .days { list-style: none; margin: var(--s1) 0 0; padding: 0; display: grid; }
  .day { display: grid; grid-template-columns: 52px 1fr; gap: var(--s3); padding: 10px var(--s2); border-top: 1px solid var(--line); }
  .day:first-child { border-top: 0; }
  .date { display: flex; flex-direction: column; line-height: 1.1; }
  .wd { font-size: var(--fs-small); color: var(--text-3); font-weight: 600; }
  .dn { font-size: 18px; font-weight: 650; }
  .items { display: grid; gap: 6px; min-width: 0; }
  .it { display: flex; align-items: center; gap: var(--s2); min-width: 0; font-size: var(--fs-meta); line-height: var(--lh-meta); }
  .t { color: var(--text-2); font-weight: 560; flex: none; }
  .n { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 520; }
  .opt { color: var(--text-3); display: inline-flex; }
  .it.clash .t { color: var(--danger); }
  .nothing { font-size: var(--fs-meta); color: var(--text-3); padding-top: 2px; }
  .clash-btn { justify-self: start; display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 var(--s3); border-radius: var(--r-pill); border: 0; background: var(--danger-soft); color: var(--danger); font-size: var(--fs-small); font-weight: 650; }
  .later { margin: var(--s3) 0 0; display: grid; grid-template-columns: 20px 1fr; gap: var(--s2); padding: var(--s3); border-radius: var(--r-row); background: var(--surface-1); font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
  .later strong { color: var(--text); font-weight: 620; }
  .later :global(svg) { margin-top: 1px; color: var(--text-3); }
</style>
