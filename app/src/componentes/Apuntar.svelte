<script>
  import { app, nuevaTarea, ir } from "../lib/estado.svelte.js";
  import { analizar, resolver } from "../lib/analizador.js";
  import { corta, rango, hora, duracion, distancia } from "../lib/fechas.js";
  import Icono from "./Icono.svelte";

  let { mod = "⌘" } = $props();
  let texto = $state(app.apuntar.texto ?? "");
  let elecciones = $state([]); // opciones elegidas para las dudas, en orden
  let campo;

  const base = $derived(analizar(texto, app.hoy));
  const r = $derived(elecciones.reduce((acc, op) => resolver(acc, acc.dudas.findIndex((d) => d.tipo === op.tipo), op), base));
  const pregunta = $derived(/[¿?]|^(busca|buscame|búscame|dónde|donde|qué|que tengo|cuándo|cuando)\b/i.test(texto.trim()));
  const puedeGuardar = $derived(!!r.titulo && r.dudas.length === 0 && !pregunta);

  $effect(() => { texto; elecciones = []; });
  $effect(() => { campo?.focus(); });

  // Texto con lo entendido resaltado
  const trozos = $derived.by(() => {
    const out = []; let i = 0;
    for (const [a, b] of base.marcas) { if (a > i) out.push([texto.slice(i, a), false]); out.push([texto.slice(a, b), true]); i = b; }
    if (i < texto.length) out.push([texto.slice(i), false]);
    return out;
  });

  function elegir(duda, op) { elecciones = [...elecciones, { ...op, tipo: duda.tipo }]; }
  function cerrar() { app.apuntar = { abierto: false, texto: "", contexto: null }; }

  async function guardar(e) {
    e?.preventDefault();
    if (!puedeGuardar) return;
    await nuevaTarea({
      ...(app.apuntar.contexto ?? {}),
      titulo: r.titulo,
      cuando: r.fecha,
      inicio: r.todoElDia ? null : r.inicio,
      duracionMin: r.inicio !== null && r.fin !== null ? r.fin - r.inicio : r.duracionMin,
    });
    cerrar();
  }
  function preguntar() { cerrar(); ir("asistente"); }
</script>

<div class="capa" role="presentation" onclick={(e) => e.target === e.currentTarget && cerrar()}>
  <form class="capa__dialogo pa-capture apuntar" role="dialog" aria-modal="true" aria-label="Apuntar" onsubmit={guardar}>
    {#if app.movil}<div class="pa-sheet__grabber"></div>{/if}
    <label class="oculto-accesible" for="apuntar-campo">Apunta una tarea o pregunta</label>
    <div class="entrada">
      <div class="espejo" aria-hidden="true">{#each trozos as [t, m]}{#if m}<span class="pa-hl">{t}</span>{:else}{t}{/if}{/each}&#8203;</div>
      <textarea id="apuntar-campo" bind:this={campo} bind:value={texto} rows="1" placeholder="Llamar a la gestoría el lunes a las 12…"
        onkeydown={(e) => { if (e.key === "Enter" && !e.shiftKey) guardar(e); if (e.key === "Escape") cerrar(); }}></textarea>
    </div>

    {#if texto.trim() && !pregunta}
      <div class="pa-capture__tokens">
        {#if r.fecha}<span class="pa-chip pa-chip--token"><Icono n="calendar" />{corta(r.fecha)} · {distancia(r.fecha, app.hoy)}</span>{/if}
        {#if r.todoElDia}<span class="pa-chip pa-chip--token"><Icono n="sun" />todo el día</span>
        {:else if r.inicio !== null && !r.dudas.some((d) => d.tipo === "hora")}<span class="pa-chip pa-chip--token"><Icono n="clock" />{rango(r.inicio, r.fin)}</span>{/if}
        {#if r.inicio !== null && r.fin !== null && !r.dudas.length}<span class="pa-chip pa-chip--token"><Icono n="hourglass" />{duracion(r.fin - r.inicio)}</span>{/if}
        {#if !r.fecha && !r.dudas.length}<span class="pa-chip pa-chip--token"><Icono n="inbox" />a la Entrada</span>{/if}
      </div>
      {#each r.dudas as d}
        <div class="pa-capture__ask">
          <span>{d.texto}</span>
          {#each d.opciones as op}<button type="button" class="pa-btn pa-btn--sm" onclick={() => elegir(d, op)}>{op.etiqueta}</button>{/each}
          {#if !d.opciones.length}<span class="pa-faint">Escribe otra fecha.</span>{/if}
        </div>
      {/each}
      {#if r.titulo && !r.dudas.length}
        <div class="pa-capture__preview">
          <Icono n={r.tipo === "evento" ? "calendar-plus" : "circle-check"} />
          <span>
            Se guardará una <b>tarea</b> «{r.titulo}»{#if r.fecha} para el <b>{corta(r.fecha)}</b>{/if}{#if r.inicio !== null && !r.todoElDia} a las <b>{hora(r.inicio)}</b>{/if}, en este dispositivo.
            {#if r.tipo === "evento"}<br />Crear eventos en tu calendario llegará al conectar tus cuentas; de momento se guarda como tarea con hora.{/if}
          </span>
        </div>
      {/if}
    {/if}

    {#if pregunta}
      <div class="pa-capture__preview">
        <Icono n="sparkles" />
        <span>Parece una pregunta. El <b>asistente</b> aún no está conectado (llegará en una versión posterior).</span>
      </div>
    {/if}

    <div class="pa-capture__foot">
      {#if !app.movil}<span><span class="pa-kbd">↩</span> guardar · <span class="pa-kbd">esc</span> cerrar</span>{/if}
      {#if pregunta}
        <button type="button" class="pa-btn" onclick={preguntar}>Ver el asistente</button>
      {:else}
        <button type="button" class="pa-btn pa-btn--plain" onclick={cerrar}>Cancelar</button>
        <button type="submit" class="pa-btn pa-btn--primary" disabled={!puedeGuardar}>Guardar tarea</button>
      {/if}
    </div>
  </form>
</div>

<style>
  .apuntar { box-shadow: var(--shadow-menu); }
  .entrada { position: relative; }
  .espejo, textarea { font: 400 17px/24px var(--font-sans); padding: 0; margin: 0; white-space: pre-wrap; word-break: break-word; }
  .espejo { color: transparent; }
  .espejo :global(.pa-hl) { color: transparent; }
  textarea { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; outline: none; resize: none; background: transparent; color: var(--text); overflow: hidden; }
  textarea::placeholder { color: var(--text-3); }
  @media (max-width: 640px) {
    .apuntar { border-radius: var(--radius-xl) var(--radius-xl) 0 0; padding: 8px 16px calc(16px + env(safe-area-inset-bottom, 0px)); min-height: 50dvh; }
    .espejo, textarea { font-size: 18px; line-height: 26px; }
    .pa-capture__foot { justify-content: stretch; }
    .pa-capture__foot :global(.pa-btn) { flex: 1; }
  }
</style>
