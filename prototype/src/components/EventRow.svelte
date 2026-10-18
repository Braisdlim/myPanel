<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { accounts } from "../data/demo.js";
  import { ui } from "../lib/ui.svelte.js";

  let { event, past = false } = $props();
  const open = $derived(ui.expanded === event.id);
</script>

<li class="row" class:past class:open>
  <button
    class="main"
    aria-expanded={open}
    onclick={() => (ui.expanded = open ? null : event.id)}
  >
    <span class="time num">
      <span>{event.start}</span>
      <span class="end">{event.end}</span>
    </span>
    <span class="body">
      <span class="title">{event.title}</span>
      <span class="meta">
        <AccountTag id={event.account} />
        {#if event.kind === "rutina"}
          <span class="kind"><Icon name="repeat" size={14} />Opcional</span>
        {/if}
      </span>
    </span>
    <span class="chev" aria-hidden="true"><Icon name="down" size={16} /></span>
  </button>
  {#if open}
    <div class="detail">
      {#if event.place}<p><Icon name="pin" size={15} />{event.place}</p>{/if}
      {#if event.note}<p class="note">{event.note}</p>{/if}
      <p class="src">En el calendario de {accounts[event.account].name} ({accounts[event.account].email})</p>
      <div class="actions">
        <a href="#calendar" class="link">Abrir en Google Calendar</a>
        {#if event.kind === "rutina"}<button class="ghost">Saltar solo hoy</button>{/if}
      </div>
    </div>
  {/if}
</li>

<style>
  .row { list-style: none; border-radius: var(--r-row); transition: background var(--t-fast) var(--ease-out); }
  .row.open { background: var(--surface-1); }
  .main {
    width: 100%;
    display: grid;
    grid-template-columns: 52px 1fr 20px;
    gap: var(--s3);
    align-items: start;
    min-height: var(--tap);
    padding: 10px var(--s3) 10px var(--s2);
    background: none;
    border: 0;
    text-align: left;
    border-radius: var(--r-row);
  }
  .main:hover { background: color-mix(in srgb, var(--surface-1) 70%, transparent); }
  .time { display: flex; flex-direction: column; font-size: var(--fs-meta); line-height: var(--lh-meta); font-weight: 600; padding-top: 2px; }
  .end { color: var(--text-3); font-weight: 500; }
  .body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .title { font-weight: 560; }
  .meta { display: flex; gap: var(--s3); align-items: center; flex-wrap: wrap; }
  .kind { display: inline-flex; gap: 4px; align-items: center; font-size: var(--fs-small); color: var(--text-2); font-weight: 520; }
  .chev { color: var(--text-3); padding-top: 3px; transition: transform var(--t-med) var(--ease-out); }
  .open .chev { transform: rotate(180deg); }
  .past .title, .past .time { color: var(--text-3); }
  .detail { padding: 0 var(--s4) var(--s4) calc(52px + var(--s3) + var(--s2)); display: grid; gap: var(--s2); font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
  .detail p { margin: 0; display: flex; gap: 6px; align-items: center; }
  .note { color: var(--text); }
  .src { color: var(--text-3); }
  .actions { display: flex; gap: var(--s4); flex-wrap: wrap; margin-top: var(--s1); }
  .link { color: var(--accent-text); text-decoration: none; font-weight: 600; min-height: 32px; display: inline-flex; align-items: center; }
  .ghost { background: none; border: 0; color: var(--text); font-weight: 600; padding: 0; min-height: 32px; }
</style>
