<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { conflict } from "../data/demo.js";
  import { ui, showToast } from "../lib/ui.svelte.js";

  let choice = $state("skip");
  const options = [
    { id: "keep", title: "Mantener el ensayo", text: "Te propondré otro día para la cena con Ana." },
    { id: "skip", title: "Faltar solo este viernes", text: "El ensayo del 23 se marca como saltado. El resto de viernes no cambia." },
    { id: "move", title: "Mover la cena", text: "Por ejemplo, a las 19:30 para terminar antes del ensayo." },
  ];
  const confirmText = { keep: "Mantener el ensayo", skip: "Faltar este viernes", move: "Elegir nueva hora" };

  function confirm() {
    ui.estado = "normal";
    if (choice === "skip") showToast("Hecho y comprobado: ensayo del 23 saltado. La serie sigue igual.");
    else if (choice === "keep") showToast("Ensayo mantenido. Te propondré otro día para la cena.");
    else showToast("Elige la nueva hora de la cena");
  }
</script>

<div class="conflict">
  <p class="eyebrow"><Icon name="alert" size={16} />Dos planes a la vez</p>
  <h2>{conflict.date}</h2>

  <div class="overlap" aria-hidden="true">
    <div class="axis num"><span>20:30</span><span>21:30</span><span>22:30</span><span>23:30</span></div>
    <div class="track"><span class="span a" style="left:16.6%;width:66.6%">{conflict.a.title}</span></div>
    <div class="track"><span class="span b" style="left:33.3%;width:66.6%">{conflict.b.title}</span></div>
  </div>

  <ul class="pair">
    <li><strong>{conflict.a.title}</strong><span class="num">{conflict.a.time}</span><span class="tagline">Plan con hora fija</span></li>
    <li><strong>{conflict.b.title}</strong><span class="num">{conflict.b.time}</span><span class="tagline"><Icon name="repeat" size={13} />Opcional, {conflict.b.series.toLowerCase()}</span></li>
  </ul>

  <fieldset>
    <legend>¿Qué prefieres?</legend>
    {#each options as o}
      <label class="opt" class:on={choice === o.id}>
        <input type="radio" name="conflict" value={o.id} bind:group={choice} />
        <span><strong>{o.title}</strong><small>{o.text}</small></span>
      </label>
    {/each}
  </fieldset>

  <p class="target">
    Se escribirá en el calendario <AccountTag id="personal" />. Antes de confirmarte, la app volverá a leer el evento para comprobar el cambio.
  </p>
  <p class="series">Cambiar toda la serie del ensayo solo se hace desde el propio ensayo y pide una segunda confirmación.</p>

  <div class="bar">
    <button class="ghost" onclick={() => (ui.estado = "normal")}>Decidir luego</button>
    <button class="primary" onclick={confirm}>{confirmText[choice]}</button>
  </div>
</div>

<style>
  .conflict { display: grid; gap: var(--s4); }
  .eyebrow { margin: 0; display: flex; align-items: center; gap: var(--s2); color: var(--danger); font-size: var(--fs-meta); font-weight: var(--w-strong); }
  h2 { margin: calc(var(--s3) * -1) 0 0; font-size: 24px; line-height: 30px; font-weight: var(--w-strong); }
  .overlap { display: grid; gap: 6px; padding: var(--s3); border-radius: var(--r-row); background: var(--surface-1); }
  .axis { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-3); }
  .track { position: relative; height: 28px; }
  .span { position: absolute; top: 0; height: 28px; border-radius: 8px; padding: 0 10px; display: flex; align-items: center; font-size: var(--fs-small); font-weight: var(--w-medium); white-space: nowrap; overflow: hidden; }
  .span.a { background: color-mix(in srgb, var(--personal) 26%, transparent); }
  .span.b { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--personal) 18%, transparent) 0 6px, color-mix(in srgb, var(--personal) 9%, transparent) 6px 12px); outline: 1px dashed color-mix(in srgb, var(--personal) 50%, transparent); }
  .pair { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); }
  .pair li { display: grid; gap: 2px; }
  .pair .num { color: var(--text-2); font-size: var(--fs-meta); }
  .tagline { display: inline-flex; gap: 4px; align-items: center; font-size: var(--fs-small); color: var(--text-3); }
  fieldset { border: 0; padding: 0; margin: 0; display: grid; gap: var(--s2); }
  legend { font-weight: var(--w-strong); margin-bottom: var(--s2); padding: 0; }
  .opt { display: grid; grid-template-columns: 22px 1fr; gap: var(--s3); align-items: start; padding: var(--s3); border-radius: var(--r-row); border: 1px solid var(--line); cursor: pointer; transition: border-color var(--t-fast), background var(--t-fast); }
  .opt.on { border-color: var(--accent); background: var(--accent-soft); }
  .opt input { accent-color: var(--accent); width: 18px; height: 18px; margin: 2px 0 0; }
  .opt span { display: grid; gap: 2px; }
  small { font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
  .target, .series { margin: 0; font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); }
  .series { color: var(--text-3); }
  .bar { display: flex; justify-content: flex-end; gap: var(--s3); }
  .primary { min-height: 48px; padding: 0 var(--s6); border: 0; border-radius: var(--r-pill); background: var(--accent-grad); color: var(--accent-ink); font-weight: var(--w-strong); }
  .ghost { min-height: 48px; padding: 0 var(--s4); border: 0; background: none; color: var(--text-2); font-weight: var(--w-medium); }
  @media (max-width: 1023px) { .bar .primary { flex: 1; } }
</style>
