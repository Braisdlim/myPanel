<script>
  // Cuánto tiempo libre queda hoy, de ahora (16:10) a las 23:00. Datos ficticios coherentes con demo.js.
  let { compact = false } = $props();
  const total = 410;
  const parts = [
    { id: "citas", label: "Citas fijas", min: 45, cls: "fixed" },
    { id: "opcional", label: "Opcional", min: 60, cls: "opt" },
    { id: "tareas", label: "Tareas", min: 30, cls: "task" },
  ];
  const free = total - parts.reduce((a, p) => a + p.min, 0);
  const R = 52, C = 2 * Math.PI * R, GAP = 4;
  let acc = 0;
  const arcs = parts.map((p) => {
    const len = (p.min / total) * C;
    const arc = { ...p, dash: `${Math.max(len - GAP, 0)} ${C}`, offset: -acc };
    acc += len;
    return arc;
  });
  const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ""}` : `${m} min`);
</script>

<div class="wrap">
<div class="ring" class:compact>
  <svg viewBox="0 0 128 128" role="img" aria-label={`Libre hoy: ${fmt(free)} hasta las 23:00`}>
    <defs>
      <pattern id="hatch-ring" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" style="fill: color-mix(in srgb, var(--accent) 30%, transparent)" />
        <rect width="2" height="6" style="fill: var(--accent)" />
      </pattern>
    </defs>
    <circle cx="64" cy="64" r={R} class="track" />
    {#each arcs as a}
      <circle cx="64" cy="64" r={R} class="seg {a.cls}" stroke-dasharray={a.dash} stroke-dashoffset={a.offset} transform="rotate(-90 64 64)" />
    {/each}
  </svg>
  <div class="center">
    <span class="big num">{fmt(free)}</span>
    <span class="lbl">libres hasta las 23:00</span>
  </div>
</div>
<ul class="legend">
  {#each parts as p}
    <li><span class="sw {p.cls}" aria-hidden="true"></span>{p.label}<span class="num v">{fmt(p.min)}</span></li>
  {/each}
</ul>
</div>

<style>
  .wrap { display: grid; }
  .ring { position: relative; width: 168px; aspect-ratio: 1; margin: 0 auto; }
  .ring.compact { width: 132px; margin: 0; }
  svg { width: 100%; height: 100%; display: block; }
  circle { fill: none; stroke-width: 12; stroke-linecap: round; }
  .track { stroke: var(--surface-3); }
  .seg.fixed { stroke: var(--accent); }
  .seg.opt { stroke: url(#hatch-ring); }
  .seg.task { stroke: color-mix(in srgb, var(--accent) 45%, var(--text)); }
  .center { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; gap: 2px; }
  .big { font-size: 26px; line-height: 30px; font-weight: var(--w-light); letter-spacing: -.02em; }
  .compact .big { font-size: 21px; line-height: 24px; }
  .lbl { font-size: 11px; line-height: 14px; color: var(--text-3); max-width: 90px; }
  .legend { list-style: none; margin: var(--s4) 0 0; padding: 0; display: grid; gap: var(--s2); }
  .legend li { display: flex; align-items: center; gap: var(--s2); font-size: var(--fs-meta); color: var(--text-2); }
  .v { margin-left: auto; color: var(--text); }
  .sw { width: 10px; height: 10px; border-radius: 3px; }
  .sw.fixed { background: var(--accent); }
  .sw.opt { background: var(--hatch), color-mix(in srgb, var(--accent) 35%, transparent); }
  .sw.task { background: color-mix(in srgb, var(--accent) 45%, var(--text)); }
  @container (max-width: 480px) and (min-width: 300px) {
    .wrap { grid-template-columns: 136px 1fr; gap: var(--s5); align-items: center; }
    .ring { width: 136px; margin: 0; }
    .big { font-size: 21px ; line-height: 24px ; }
    .legend { margin: 0 ; }
  }
</style>
