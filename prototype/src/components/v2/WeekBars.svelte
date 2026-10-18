<script>
  import { ui } from "../../lib/ui.svelte.js";
  // Horas comprometidas por día: parte fija (sólida) y opcional (rayada).
  const days = [
    { d: "L", n: 19, fixed: 3, opt: 0 },
    { d: "M", n: 20, fixed: 4, opt: 0 },
    { d: "X", n: 21, fixed: 2.5, opt: 0.5 },
    { d: "J", n: 22, fixed: 1.75, opt: 1, today: true },
    { d: "V", n: 23, fixed: 2, opt: 2, clash: true },
    { d: "S", n: 24, fixed: 1, opt: 0 },
    { d: "D", n: 25, fixed: 0, opt: 0 },
  ];
  const MAX = 5, H = 128;
  const h = (v) => (v / MAX) * H;
  const fmt = (v) => `${Math.floor(v)} h${v % 1 ? ` ${Math.round((v % 1) * 60)} min` : ""}`;
</script>

<div class="chart" style={`--h:${H}px`}>
  <div class="grid" aria-hidden="true"><span>5 h</span><span>2,5 h</span><span>0</span></div>
  <ol class="bars">
    {#each days as day}
      <li class:today={day.today} class:past={day.n < 22}>
        <button
          class="col"
          aria-label={`${day.d} ${day.n}: ${fmt(day.fixed)} fijas${day.opt ? `, ${fmt(day.opt)} opcionales` : ""}${day.clash ? ", con un conflicto" : ""}`}
          onclick={() => day.clash && (ui.estado = "conflicto")}
        >
          {#if day.clash}<span class="clash" aria-hidden="true"></span>{/if}
          {#if day.opt}<span class="opt" style={`height:${h(day.opt)}px`}></span>{/if}
          {#if day.fixed}<span class="fixed" style={`height:${h(day.fixed)}px`}></span>{:else}<span class="zero"></span>{/if}
        </button>
        <span class="lbl">{day.d}</span>
      </li>
    {/each}
  </ol>
</div>
<p class="key"><span class="k fixed"></span>Fijo <span class="k opt"></span>Opcional <span class="k clash"></span>Conflicto</p>

<style>
  .chart { position: relative; display: grid; grid-template-columns: 34px 1fr; gap: var(--s2); }
  .grid { height: var(--h); display: flex; flex-direction: column; justify-content: space-between; font-size: 10.5px; color: var(--text-3); padding-bottom: 0; }
  .grid span { line-height: 1; }
  .bars { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; align-items: end; }
  .bars li { display: grid; justify-items: center; gap: 6px; }
  .col { position: relative; width: 100%; max-width: 30px; height: var(--h); display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; padding: 0; border: 0; background: none; cursor: default; }
  .fixed { display: block; border-radius: 7px; background: color-mix(in srgb, var(--accent) 38%, var(--surface-3)); }
  .today .fixed, .today .opt { box-shadow: 0 0 0 1px var(--accent) inset; }
  .today .fixed { background: var(--accent-grad); }
  .past .fixed { background: var(--surface-3); }
  .opt { display: block; border-radius: 7px; background: var(--hatch), color-mix(in srgb, var(--accent) 16%, transparent); }
  .zero { display: block; height: 3px; border-radius: 2px; background: var(--line-strong); }
  .clash { align-self: center; margin-bottom: 4px; flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--danger); box-shadow: 0 0 0 3px var(--danger-soft); }
  .bars li:has(.clash) .col { cursor: pointer; }
  .lbl { font-size: var(--fs-small); color: var(--text-3); }
  .today .lbl { color: var(--text); font-weight: var(--w-medium); }
  .key { margin: var(--s4) 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: var(--fs-small); color: var(--text-3); }
  .k { width: 10px; height: 10px; border-radius: 3px; margin-left: 6px; }
  .k:first-child { margin-left: 0; }
  .k.fixed { background: var(--accent); }
  .k.opt { background: var(--hatch), color-mix(in srgb, var(--accent) 16%, transparent); }
  .k.clash { border-radius: 50%; background: var(--danger); width: 9px; height: 9px; }
</style>
