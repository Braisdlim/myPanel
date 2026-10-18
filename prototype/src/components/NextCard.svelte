<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { events, now } from "../data/demo.js";

  let { size = "md" } = $props();
  const next = events.find((e) => e.startMin > now.minutes);
  const mins = next.startMin - now.minutes;
  const until = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
</script>

<article class="hero {size}" aria-label="Lo siguiente">
  <p class="when"><span class="pulse" aria-hidden="true"></span>Dentro de {until}</p>
  <h2>{next.title}</h2>
  <p class="time num">{next.start}–{next.end}</p>
  <div class="foot">
    <span class="place"><Icon name="pin" size={15} />{next.place}</span>
    <AccountTag id={next.account} />
  </div>
  {#if next.note}<p class="note">{next.note}</p>{/if}
</article>

<style>
  .hero {
    position: relative;
    padding: var(--s5) var(--s5) var(--s5);
    border-radius: var(--r-card);
    background: var(--hero-fill);
    box-shadow: var(--shadow-hero);
    isolation: isolate;
    overflow: hidden;
  }
  /* Luz cálida desde arriba: el único elemento con «material» */
  .hero::before {
    content: "";
    position: absolute;
    inset: -60% -30% auto 35%;
    height: 130%;
    background: radial-gradient(closest-side, var(--accent-soft), transparent 80%);
    z-index: -1;
    opacity: .55;
  }
  .when { margin: 0; display: flex; align-items: center; gap: var(--s2); font-size: var(--fs-meta); line-height: var(--lh-meta); font-weight: var(--w-medium); color: var(--accent-text); }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
  h2 { margin: var(--s3) 0 0; font-size: 26px; line-height: 30px; font-weight: var(--w-strong); letter-spacing: -.01em; }
  .lg h2 { font-size: 34px; line-height: 38px; letter-spacing: -.02em; }
  .time { margin: var(--s1) 0 0; font-size: var(--fs-title); line-height: var(--lh-title); color: var(--text-2); font-weight: var(--w-regular); }
  .foot { margin-top: var(--s4); display: flex; justify-content: space-between; align-items: center; gap: var(--s3); flex-wrap: wrap; }
  .place { display: inline-flex; gap: 6px; align-items: center; font-size: var(--fs-meta); color: var(--text-2); }
  .note { margin: var(--s3) 0 0; padding-top: var(--s3); border-top: 1px solid var(--line); font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
</style>
