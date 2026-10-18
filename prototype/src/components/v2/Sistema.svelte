<script>
  import { onMount } from "svelte";
  import Icon from "../Icon.svelte";
  import PageHead from "./PageHead.svelte";
  import Card from "./Card.svelte";
  import AccountTag from "../AccountTag.svelte";
  import TaskRow from "../TaskRow.svelte";
  import EventRow from "../EventRow.svelte";
  import { events } from "../../data/demo.js";
  import { ui } from "../../lib/ui.svelte.js";

  const colors = [
    ["--bg", "Fondo"], ["--surface-1", "Cristal"], ["--surface-2", "Hoja"], ["--surface-3", "Control"],
    ["--text", "Texto"], ["--text-2", "Texto secundario"], ["--text-3", "Texto terciario"],
    ["--accent", "Acento"], ["--personal", "Cuenta Personal"], ["--secundaria", "Cuenta Secundaria"],
    ["--ok", "Hecho"], ["--attention", "Atención"], ["--danger", "Conflicto"],
  ];
  const type = [
    ["--fs-hero", "Saludo", "Buenas tardes", "var(--w-regular)"],
    ["--fs-number", "Cifra", "17:30", "var(--w-light)"],
    ["--fs-display", "Título de página", "Planificar", "var(--w-regular)"],
    ["--fs-title", "Título de tarjeta", "Para hoy", "var(--w-medium)"],
    ["--fs-body", "Texto", "Revisar el CV antes de enviarlo", "var(--w-regular)"],
    ["--fs-meta", "Detalle", "Clínica Arenal, C/ Mayor 12", "var(--w-regular)"],
    ["--fs-small", "Etiqueta", "Opcional", "var(--w-medium)"],
  ];
  const space = ["--s1", "--s2", "--s3", "--s4", "--s5", "--s6", "--s8", "--s10"];
  const radii = [["--r-chip", "Chip"], ["--r-row", "Fila"], ["--r-card", "Tarjeta"], ["--r-sheet", "Hoja"]];
  let values = $state({});
  let seg = $state("dia");

  function read() {
    const cs = getComputedStyle(document.documentElement);
    const v = {};
    for (const [k] of colors) v[k] = cs.getPropertyValue(k).trim();
    for (const [k] of type) v[k] = cs.getPropertyValue(k).trim();
    for (const k of space) v[k] = cs.getPropertyValue(k).trim();
    for (const [k] of radii) v[k] = cs.getPropertyValue(k).trim();
    values = v;
  }
  onMount(read);
  $effect(() => { ui.theme; ui.accent; ui.font; requestAnimationFrame(read); });
</script>

<PageHead title="Sistema de diseño" subtitle="De los tokens a los componentes. Cambia tema, acento y fuente en «Revisión»." actions={false} />

<div class="grid">
  <Card title="Color" subtitle="Tokens semánticos; el color de cuenta siempre va con su nombre" cls="s-wide">
    <ul class="swatches">
      {#each colors as [k, name]}
        <li><span class="sw" style={`background: var(${k})`}></span><span class="nm">{name}</span><code>{k}</code><code class="v">{values[k] ?? ""}</code></li>
      {/each}
    </ul>
  </Card>

  <Card title="Tipografía" subtitle="Geométrica, pesos ligeros; jerarquía por tamaño" cls="s-wide">
    <ul class="types">
      {#each type as [k, name, sample, w]}
        <li><span class="meta">{name}<code>{k} · {values[k] ?? ""}</code></span><span class="sample num" style={`font-size: var(${k}); font-weight: ${w}`}>{sample}</span></li>
      {/each}
    </ul>
  </Card>

  <Card title="Espacio y radios" subtitle="Retícula de 4 px">
    <div class="space">
      {#each space as k}<div class="sp"><span style={`width: var(${k}); height: var(${k})`}></span><code>{values[k] ?? ""}</code></div>{/each}
    </div>
    <div class="radii">
      {#each radii as [k, name]}<div class="rd"><span style={`border-radius: var(${k})`}></span><small>{name}</small></div>{/each}
    </div>
  </Card>

  <Card title="Botones y controles">
    <div class="row">
      <button class="b-primary"><Icon name="plus" size={16} />Apuntar algo</button>
      <button class="b-secondary">Posponer</button>
      <button class="b-ghost">Decidir luego</button>
      <button class="b-icon" aria-label="Abrir"><Icon name="open" size={17} /></button>
    </div>
    <div class="row">
      <div class="seg" role="group" aria-label="Escala">
        {#each [["dia", "Día"], ["semana", "Semana"], ["mes", "Mes"]] as [id, n]}<button class:on={seg === id} aria-pressed={seg === id} onclick={() => (seg = id)}>{n}</button>{/each}
      </div>
      <label class="field"><Icon name="search" size={16} /><input placeholder="Busca o apunta algo" /></label>
    </div>
    <div class="row">
      <span class="pill ok"><Icon name="check" size={13} />Hecho y comprobado</span>
      <span class="pill warn"><Icon name="alert" size={13} />Pide atención</span>
      <span class="pill bad"><Icon name="alert" size={13} />Conflicto</span>
      <AccountTag id="personal" /><AccountTag id="secundaria" />
    </div>
  </Card>

  <Card title="Filas" subtitle="Tarea, evento fijo y rutina opcional" flush>
    <ul class="list">
      <TaskRow task={{ id: "sys1", title: "Revisar el CV antes de enviarlo", estimate: "30 min" }} />
      <EventRow event={events[1]} />
      <EventRow event={events[2]} />
    </ul>
  </Card>

  <Card title="Principios" subtitle="Lo que hace que se vea limpio">
    <ul class="rules">
      <li>Un tamaño grande y ligero manda; todo lo demás es pequeño y tranquilo.</li>
      <li>Cada tarjeta: título a la izquierda, una sola acción a la derecha.</li>
      <li>Rayado significa opcional; sólido, fijo; punto rojo, conflicto.</li>
      <li>Nada de color sin texto: la cuenta siempre dice su nombre.</li>
      <li>El acento solo marca «ahora», el foco y la acción principal.</li>
    </ul>
  </Card>
</div>

<style>
  .grid { display: grid; gap: var(--s4); }
  code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11px; color: var(--text-3); }
  .swatches { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--s3); }
  .swatches li { display: grid; gap: 4px; }
  .sw { height: 52px; border-radius: var(--r-row); border: 1px solid var(--line-strong); }
  .nm { font-size: var(--fs-meta); }
  .v { word-break: break-all; }
  .types { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4); }
  .types li { display: grid; gap: 4px; padding-bottom: var(--s3); border-bottom: 1px solid var(--line); }
  .types li:last-child { border-bottom: 0; }
  .meta { display: flex; gap: var(--s3); align-items: baseline; font-size: var(--fs-small); color: var(--text-3); }
  .sample { line-height: 1.15; letter-spacing: -.01em; overflow-wrap: anywhere; }
  .space { display: flex; align-items: flex-end; gap: var(--s3); flex-wrap: wrap; }
  .sp { display: grid; justify-items: center; gap: 4px; }
  .sp span { display: block; background: var(--accent-soft); border: 1px solid var(--accent); border-radius: 3px; }
  .radii { display: flex; gap: var(--s4); margin-top: var(--s5); flex-wrap: wrap; }
  .rd { display: grid; justify-items: center; gap: 4px; }
  .rd span { width: 56px; height: 56px; border: 1px solid var(--line-strong); background: var(--surface-3); display: block; }
  .rd small { font-size: var(--fs-small); color: var(--text-3); }
  .row { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; margin-bottom: var(--s4); }
  .row:last-child { margin-bottom: 0; }
  .row button { display: inline-flex; align-items: center; gap: var(--s2); min-height: 44px; border-radius: var(--r-pill); font-size: 14.5px; font-weight: var(--w-medium); padding: 0 var(--s4); }
  .b-primary { border: 0; background: var(--accent-grad); color: var(--accent-ink); }
  .b-secondary { border: 1px solid var(--line-strong); background: var(--surface-3); color: var(--text); }
  .b-ghost { border: 0; background: none; color: var(--text-2); }
  .row .b-icon { width: 40px; min-height: 40px; padding: 0; justify-content: center; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--surface-3); color: var(--text-2); }
  .seg { display: inline-flex; padding: 3px; border-radius: var(--r-pill); background: var(--surface-3); border: 1px solid var(--line); }
  .row .seg button { min-height: 34px; border: 0; background: none; color: var(--text-2); font-size: var(--fs-meta); padding: 0 var(--s4); }
  .row .seg button.on { background: var(--text); color: var(--bg); }
  .field { flex: 1; min-width: 200px; display: flex; align-items: center; gap: var(--s2); min-height: 44px; padding: 0 var(--s4); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: var(--surface-1); color: var(--text-3); }
  .field input { flex: 1; min-width: 0; border: 0; background: none; outline: none; color: var(--text); }
  .pill { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; padding: 0 var(--s3); border-radius: var(--r-pill); font-size: var(--fs-small); font-weight: var(--w-medium); }
  .pill.ok { background: color-mix(in srgb, var(--ok) 14%, transparent); color: var(--ok); }
  .pill.warn { background: color-mix(in srgb, var(--attention) 14%, transparent); color: var(--attention); }
  .pill.bad { background: var(--danger-soft); color: var(--danger); }
  .list { list-style: none; margin: 0; padding: 0; }
  .rules { margin: 0; padding-left: 1.1em; display: grid; gap: var(--s2); color: var(--text-2); font-size: var(--fs-meta); line-height: var(--lh-meta); }
  @media (min-width: 1024px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s5); align-items: start; }
    :global(.s-wide) { grid-column: 1 / -1; }
  }
</style>
