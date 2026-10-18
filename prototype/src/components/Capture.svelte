<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { interpret } from "../lib/interpret.js";
  import { freeSlots, accounts } from "../data/demo.js";
  import { ui, showToast, go } from "../lib/ui.svelte.js";

  let { variant = "a", initial = "", onsaved } = $props();

  let text = $state(initial);
  let chosenTime = $state(null);
  let dest = $state("local"); // local | calendar
  let account = $state(null);

  const parsed = $derived(interpret(text));
  const time = $derived(parsed.ambiguous ? chosenTime : parsed.timeOptions[0] ?? null);
  // Conflicto de ejemplo: viernes 23 desde las 21:00 choca con el ensayo
  const clashes = $derived(parsed.dateLabel?.startsWith("Viernes 23") && time && time >= "21:00" && time < "23:30");
  const canSave = $derived(text.trim().length > 0 && (!parsed.ambiguous || chosenTime) && (dest === "local" || account));

  $effect(() => { parsed.ambiguous; chosenTime = null; });

  function save() {
    if (!canSave) return;
    if (dest === "calendar") showToast(`Evento creado en el calendario ${accounts[account].name} y comprobado`);
    else if (parsed.kind === "sin-fecha") showToast("Guardado en Pendientes, sin fecha");
    else showToast("Guardado en tus tareas con fecha");
    onsaved?.();
  }
</script>

<form class="capture v-{variant}" onsubmit={(e) => { e.preventDefault(); save(); }}>
  <label class="sr-only" for="cap">Qué tienes que hacer</label>
  <textarea
    id="cap"
    bind:value={text}
    rows="1"
    placeholder="Escribe o dicta algo pendiente"
    autocomplete="off"
    enterkeyhint="done"
    onkeydown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); } }}
  ></textarea>
  <p class="hint">Para dictar, usa el micrófono del teclado.</p>

  {#if text.trim()}
    <div class="preview" aria-live="polite">
      <div class="line">
        <span class="k">Qué</span>
        <span class="v strong">{parsed.title || "…"}</span>
      </div>
      <div class="line">
        <span class="k">Cuándo</span>
        <span class="v">
          {#if parsed.kind === "sin-fecha"}
            Sin fecha. Irá a Pendientes y te propondré cuándo.
          {:else}
            {parsed.dateLabel ?? "Día por decidir"}{#if time}, <span class="num">{time}</span>{/if}
          {/if}
        </span>
      </div>

      {#if parsed.ambiguous}
        <fieldset class="ask">
          <legend>¿A qué hora exactamente?</legend>
          <div class="seg">
            {#each parsed.timeOptions as opt}
              <button type="button" class:on={chosenTime === opt} aria-pressed={chosenTime === opt} onclick={() => (chosenTime = opt)}>
                <span class="num">{opt}</span><small>{opt < "12:00" ? "por la mañana" : "por la noche"}</small>
              </button>
            {/each}
          </div>
        </fieldset>
      {/if}

      {#if clashes}
        <div class="clash" role="note">
          <Icon name="alert" size={16} />
          <span>Se solapa con <strong>Ensayo</strong> (opcional, <span class="num">21:30–23:30</span>).</span>
          <button type="button" class="link" onclick={() => { ui.estado = "conflicto"; go("hoy"); }}>Ver opciones</button>
        </div>
      {/if}

      {#if variant === "b" && parsed.kind === "sin-fecha"}
        <div class="slots">
          <p class="k">Huecos libres hoy</p>
          {#each freeSlots as s}
            <button type="button" class="slot" onclick={() => showToast(`Propuesto para hoy, ${s.label}`)}><span class="num">{s.label}</span><small>{s.why}</small></button>
          {/each}
        </div>
      {/if}

      {#if parsed.kind !== "sin-fecha"}
        <fieldset class="dest">
          <legend>Dónde guardarlo</legend>
          <label class:on={dest === "local"}><input type="radio" bind:group={dest} value="local" />Solo en myPanel, como tarea con fecha</label>
          <label class:on={dest === "calendar"}><input type="radio" bind:group={dest} value="calendar" />Como evento en Google Calendar</label>
          {#if dest === "calendar"}
            <div class="accounts" role="group" aria-label="Cuenta de destino">
              {#each Object.values(accounts) as a}
                <button type="button" class:on={account === a.id} aria-pressed={account === a.id} onclick={() => (account = a.id)}>
                  <AccountTag id={a.id} /><small>{a.email}</small>
                </button>
              {/each}
            </div>
          {/if}
        </fieldset>
      {/if}
    </div>
  {/if}

  <div class="bar">
    <button type="submit" class="primary" disabled={!canSave}>
      {dest === "calendar" && account ? `Crear en ${accounts[account].name}` : "Guardar"}
    </button>
  </div>
</form>

<style>
  .capture { display: grid; gap: var(--s3); }
  #cap {
    width: 100%;
    min-height: 56px;
    field-sizing: content;
    resize: none;
    padding: 15px var(--s4);
    line-height: 26px;
    border-radius: var(--r-row);
    border: 1px solid var(--line-strong);
    background: var(--bg);
    font-size: 18px;
    font-weight: var(--w-regular);
    outline: none;
  }
  #cap:focus { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
  .hint { margin: 0; font-size: var(--fs-small); color: var(--text-3); padding-left: var(--s1); }
  .preview { display: grid; gap: var(--s3); padding: var(--s4); border-radius: var(--r-row); background: var(--surface-1); border: 1px solid var(--line); }
  .line { display: grid; grid-template-columns: 64px 1fr; gap: var(--s3); }
  .k { margin: 0; font-size: var(--fs-meta); color: var(--text-3); font-weight: var(--w-medium); }
  .v { font-size: var(--fs-body); }
  .strong { font-weight: var(--w-medium); }
  fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  legend { font-size: var(--fs-meta); font-weight: var(--w-medium); color: var(--text); margin-bottom: var(--s2); padding: 0; }
  .ask legend { color: var(--attention); }
  .seg { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
  .seg button, .accounts button, .slot {
    min-height: 52px; border-radius: var(--r-row); border: 1px solid var(--line-strong); background: var(--surface-2);
    display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; padding: 6px var(--s3); text-align: left;
    transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out);
  }
  .seg button span { font-weight: var(--w-strong); font-size: 17px; }
  small { font-size: var(--fs-small); color: var(--text-3); }
  .seg button.on, .accounts button.on { border-color: var(--accent); background: var(--accent-soft); }
  .clash { display: flex; gap: var(--s2); align-items: center; flex-wrap: wrap; padding: var(--s3); border-radius: var(--r-chip); background: var(--danger-soft); color: var(--text); font-size: var(--fs-meta); line-height: var(--lh-meta); }
  .clash :global(svg) { color: var(--danger); flex: none; }
  .link { background: none; border: 0; padding: 0; color: var(--accent-text); font-weight: var(--w-strong); min-height: 32px; margin-left: auto; }
  .slots { display: grid; gap: var(--s2); }
  .dest label { display: flex; gap: var(--s3); align-items: center; min-height: 44px; padding: 0 var(--s3); border-radius: var(--r-chip); font-size: var(--fs-meta); }
  .dest label.on { background: var(--surface-3); }
  .dest input { accent-color: var(--accent); width: 18px; height: 18px; margin: 0; }
  .accounts { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
  .bar { display: flex; justify-content: flex-end; }
  .primary { min-height: 48px; padding: 0 var(--s6); border: 0; border-radius: var(--r-pill); background: var(--accent-grad); color: var(--accent-ink); font-weight: var(--w-strong); transition: opacity var(--t-fast); }
  .primary:disabled { background: var(--surface-3); color: var(--text-3); cursor: not-allowed; }
  @media (max-width: 1023px) { .bar .primary { width: 100%; } }
</style>
