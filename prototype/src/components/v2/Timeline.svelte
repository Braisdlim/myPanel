<script>
  import Icon from "../Icon.svelte";
  import AccountTag from "../AccountTag.svelte";
  import { events, now } from "../../data/demo.js";
  import { showToast } from "../../lib/ui.svelte.js";

  let { hourHeight = 76 } = $props();
  const START = Math.floor(now.minutes / 60) * 60, END = 24 * 60;
  const y = (m) => ((m - START) / 60) * hourHeight;
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i);
  const list = events.filter((e) => e.endMin > START);
  const slots = [
    { s: 16 * 60 + 30, e: 17 * 60 + 15, label: "16:30–17:15", len: "45 min libres" },
    { s: 18 * 60 + 30, e: 19 * 60 + 45, label: "18:30–19:45", len: "1 h 15 min libres" },
    { s: 21 * 60, e: 23 * 60, label: "21:00–23:00", len: "2 h libres" },
  ];
</script>

<div class="tl" style={`height:${y(END) + 8}px`} aria-label="Línea del día desde ahora">
  {#each hours as h}
    <div class="hour num" style={`top:${y(h * 60)}px`}><span class:hide={Math.abs(h * 60 - now.minutes) < 20}>{String(h % 24).padStart(2, "0")}:00</span></div>
  {/each}
  {#each slots as s}
    <button class="slot" class:short={s.e - s.s < 60} style={`top:${y(s.s) + 3}px;height:${y(s.e) - y(s.s) - 6}px`} onclick={() => showToast(`Colocar una tarea en ${s.label}`)}>
      <span><Icon name="plus" size={14} />{s.len}</span><small class="num">{s.label}</small>
    </button>
  {/each}
  {#each list as e}
    <div class="ev" class:short={e.endMin - e.startMin < 60} class:rutina={e.kind === "rutina"} style={`top:${y(e.startMin) + 3}px;height:${y(e.endMin) - y(e.startMin) - 6}px;--c:var(--${e.account})`}>
      <span class="t">{e.title}</span>
      <span class="m"><span class="num">{e.start}–{e.end}</span>{#if e.kind === "rutina"}<span class="o"><Icon name="repeat" size={12} />Opcional</span>{/if}<AccountTag id={e.account} compact /></span>
    </div>
  {/each}
  <div class="now" style={`top:${y(now.minutes)}px`}><span class="num">{now.label}</span></div>
</div>

<style>
  .tl { position: relative; }
  .hour { position: absolute; left: 50px; right: 0; height: 0; border-top: 1px dashed var(--line); }
  .hour span { position: absolute; top: -8px; left: -50px; font-size: 11.5px; color: var(--text-3); }
  .hour span.hide { visibility: hidden; }
  .ev, .slot { position: absolute; left: 60px; right: 0; border-radius: 14px; padding: 10px 14px; display: flex; flex-direction: column; justify-content: center; gap: 3px; overflow: hidden; }
  .ev { background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 30%, transparent), color-mix(in srgb, var(--accent) 12%, transparent)); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }
  .ev.rutina { background: var(--hatch), color-mix(in srgb, var(--accent) 10%, transparent); border-style: dashed; }
  .short { flex-direction: row; align-items: center; justify-content: space-between; gap: var(--s3); padding-top: 0; padding-bottom: 0; }
  .t { font-weight: var(--w-medium); font-size: 15px; }
  .m { display: flex; align-items: center; gap: var(--s2); font-size: var(--fs-small); color: var(--text-2); }
  .o { display: inline-flex; align-items: center; gap: 3px; }
  .slot { border: 1px dashed var(--line-strong); background: none; text-align: left; color: var(--text-2); font-size: var(--fs-meta); }
  .slot span { display: inline-flex; align-items: center; gap: 6px; }
  .slot small { color: var(--text-3); font-size: var(--fs-small); }
  .slot:hover { border-color: var(--accent); color: var(--text); }
  .now { position: absolute; left: 50px; right: 0; height: 0; border-top: 2px solid var(--accent); z-index: 2; }
  .now::before { content: ""; position: absolute; left: -5px; top: -6px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
  .now span { position: absolute; left: -50px; top: -9px; font-size: 11.5px; font-weight: var(--w-medium); color: var(--accent-text); }
</style>
