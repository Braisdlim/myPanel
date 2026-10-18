<script>
  import Icon from "../Icon.svelte";
  import AccountTag from "../AccountTag.svelte";
  import Card from "./Card.svelte";
  import { events, now } from "../../data/demo.js";
  import { showToast } from "../../lib/ui.svelte.js";

  const next = events.find((e) => e.startMin > now.minutes);
  const mins = next.startMin - now.minutes;
  const later = events.filter((e) => e.startMin > next.startMin);
  const until = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
</script>

<Card hero cls="hero-card">
  <div class="top">
    <p class="chip"><span class="pulse" aria-hidden="true"></span>Lo siguiente, dentro de {until}</p>
    <button class="ib" aria-label="Ver el evento" title="Ver el evento" onclick={() => showToast("Se abriría el evento en Google Calendar")}><Icon name="open" size={17} /></button>
  </div>
  <div class="main">
    <h2>{next.title}</h2>
    <p class="time num">{next.start}<span>–{next.end}</span></p>
  </div>
  <div class="foot">
    <span class="place"><Icon name="pin" size={15} />{next.place}</span>
    <AccountTag id={next.account} />
  </div>
  {#if next.note}<p class="note">{next.note}</p>{/if}
  <ol class="after" aria-label="Después">
    {#each later as e}
      <li><span class="num">{e.start}</span>{e.title}{#if e.kind === "rutina"}<span class="o"><Icon name="repeat" size={12} />Opcional</span>{/if}</li>
    {/each}
  </ol>
</Card>

<style>
  :global(.hero-card) { display: flex; flex-direction: column; }
  .top { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); }
  .ib { flex: none; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--surface-3); color: var(--text-2); }
  .chip { margin: 0; display: inline-flex; align-items: center; gap: var(--s2); min-height: 30px; padding: 0 var(--s3); border-radius: var(--r-pill); background: var(--accent-soft); color: var(--accent-text); font-size: var(--fs-meta); font-weight: var(--w-medium); }
  .pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
  .main { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s4); flex-wrap: wrap; padding-top: var(--s6); }
  h2 { margin: 0; font-size: 30px; line-height: 36px; font-weight: var(--w-regular); letter-spacing: -.02em; }
  .time { margin: 0; font-size: var(--fs-number); line-height: var(--lh-number); font-weight: var(--w-light); letter-spacing: -.02em; }
  .time span { font-size: 22px; color: var(--text-3); letter-spacing: 0; }
  .foot { margin-top: var(--s5); display: flex; justify-content: space-between; align-items: center; gap: var(--s3); flex-wrap: wrap; }
  .place { display: inline-flex; gap: 6px; align-items: center; font-size: var(--fs-meta); color: var(--text-2); }
.after { display: none; list-style: none; margin: auto 0 0; padding: var(--s4) 0 0; gap: var(--s2); border-top: 1px solid var(--line); }
  .after li { display: flex; align-items: center; gap: var(--s3); font-size: var(--fs-meta); color: var(--text-3); }
  .after li::before { content: "Después"; color: var(--text-3); }
  .after .num { color: var(--text-2); }
  .o { display: inline-flex; align-items: center; gap: 3px; }
  @container (min-width: 500px) { .after { display: grid; } }
  .note { margin: var(--s4) 0 var(--s5); padding-top: var(--s4); border-top: 1px solid var(--line); font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
</style>
