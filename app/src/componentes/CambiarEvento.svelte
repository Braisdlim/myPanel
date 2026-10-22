<script>
  // Cambiar un evento solo esta vez (D-052), calcado de la maqueta AndroidOcurrencia: «Mover esta vez» con huecos
  // libres de la misma duración u «Otra hora…», «Saltar esta vez» y, si Pauta no puede escribir en ese calendario,
  // «No voy esta vez» solo en Pauta. Toda escritura en Google: tarjeta con la cuenta, clic en «… en ‹cuenta›» y relectura.
  import { app, marcarNoVoy, sePuedeCambiar, saltarEnGoogle, moverEnGoogle, avisar } from "../lib/estado.svelte.js";
  import { eventosDelDia, cuenta } from "../lib/agenda.svelte.js";
  import { proponerHuecos, pisaria } from "../lib/calendario.js";
  import { calendariosPropios } from "../lib/google.js";
  import { corta, rango, duracion, DIAS, diaSemana } from "../lib/fechas.js";
  import Icono from "./Icono.svelte";

  let { evento } = $props();

  let modo = $state(null); // null | "mover" | "saltar"
  let destino = $state(null); // { dia, inicio, fin }
  let otra = $state(false);
  let otraDia = $state(""), otraHora = $state("");
  let trabajando = $state(false);
  let error = $state("");
  let hecho = $state(null); // { titulo, texto, diferencias }

  const c = $derived(evento?.cuenta ? cuenta(evento.cuenta) : null);
  const real = $derived(!!evento && !evento.ejemplo && !evento.tarea && !!evento.cuenta && app.cuentas.length > 0);
  const escribible = $derived(real && sePuedeCambiar(evento));
  const propio = $derived(real && !!app.cuentas.find((x) => x.id === evento.cuenta) && calendariosPropios(app.cuentas.find((x) => x.id === evento.cuenta)).some((x) => x.id === evento.calendarioId));
  const esteDia = $derived(evento ? `este ${DIAS[diaSemana(evento.dia)]}` : "");
  const eventosDe = (d) => eventosDelDia(d, app.hoy);
  const huecos = $derived(modo === "mover" && evento ? proponerHuecos(evento, eventosDe, app.hoy, app.ahora) : []);
  const choques = $derived(destino && evento ? pisaria(evento, destino.dia, destino.inicio, destino.fin, eventosDe) : []);
  const calendarioNombre = $derived(evento?.calendario && evento.calendario !== c?.correo ? `«${evento.calendario}»` : "principal");

  // Al cambiar de evento, se empieza de cero
  let anterior = null;
  $effect(() => { const id = evento?.id; if (id !== anterior) { anterior = id; modo = null; destino = null; otra = false; error = ""; if (id) hecho = null; } });

  function aMinutos(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
  function usarOtra() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otraDia) || !/^\d{2}:\d{2}$/.test(otraHora)) { destino = null; return; }
    const ini = aMinutos(otraHora);
    destino = { dia: otraDia, inicio: ini, fin: ini + (evento.fin - evento.inicio) };
  }
  function empezarMover() { modo = "mover"; destino = null; otra = false; otraDia = evento.dia; otraHora = `${String(Math.floor(evento.inicio / 60)).padStart(2, "0")}:${String(evento.inicio % 60).padStart(2, "0")}`; }
  function cancelar() { modo = null; destino = null; error = ""; }

  async function confirmar() {
    trabajando = true; error = "";
    // Se copia antes de escribir: al moverlo o saltarlo, el evento deja de estar en este día y `evento` se vacía
    const titulo = evento.titulo, antes = `${corta(evento.dia)}, ${rango(evento.inicio, evento.fin)}`, deSerie = !!evento.serie;
    try {
      if (modo === "saltar") {
        const diferencias = await saltarEnGoogle(evento);
        hecho = { titulo: diferencias.length ? "Hecho, pero revísalo" : "Saltado y comprobado en Google", texto: `«${titulo}» ya no está el ${antes}. El resto de la serie sigue igual.`, diferencias };
      } else {
        const d = destino;
        const diferencias = await moverEnGoogle(evento, d);
        hecho = { titulo: diferencias.length ? "Movido, pero Google lo guardó distinto" : "Movido y comprobado en Google", texto: `«${titulo}»: ${antes} → ${corta(d.dia)}, ${rango(d.inicio, d.fin)}.${deSerie ? " El resto de la serie sigue igual." : ""}`, diferencias };
      }
      avisar(hecho.titulo);
      modo = null; destino = null;
    } catch (e) { error = e.message; }
    trabajando = false;
  }

  async function noVoy(valor) {
    await marcarNoVoy(evento, valor);
    avisar(valor ? `No vas esta vez: ${evento.titulo}` : `Vuelves a ir: ${evento.titulo}`);
  }
</script>

{#if hecho}
  <div class="hecho" role="status">
    <span class="hecho__icono" class:aviso={hecho.diferencias.length}><Icono n={hecho.diferencias.length ? "triangle-alert" : "check"} /></span>
    <div><b>{hecho.titulo}</b><p>{hecho.texto}</p>{#each hecho.diferencias as d}<p class="dif">{d}</p>{/each}</div>
  </div>
{/if}
{#if error && !evento}<p class="error" role="alert">{error}</p>{/if}

{#if evento && real}
  {#if evento.noVoy}
    <div class="pa-insp__rows nota-novoy"><Icono n="undo-2" /><span>No vas {esteDia}<small>Solo en Pauta: no cuenta en tu tiempo libre ni en los solapes. En Google sigue igual.</small></span></div>
  {/if}

  {#if modo === null}
    <div class="pa-insp__actions">
      {#if evento.enlace}<a class="pa-btn pa-btn--sm" href={evento.enlace} target="_blank" rel="noopener noreferrer"><Icono n="external-link" tam={14} />Abrir en Google Calendar</a>{/if}
      {#if escribible && !evento.todoElDia}<button class="pa-btn pa-btn--sm" onclick={empezarMover}><Icono n="calendar-days" tam={14} />{evento.serie ? "Mover esta vez" : "Mover"}</button>{/if}
      {#if escribible && evento.serie}<button class="pa-btn pa-btn--sm" onclick={() => { modo = "saltar"; }}><Icono n="x" tam={14} />Saltar esta vez</button>{/if}
      {#if !escribible && !evento.todoElDia}
        {#if evento.noVoy}<button class="pa-btn pa-btn--sm" onclick={() => noVoy(false)}><Icono n="undo-2" tam={14} />Sí voy</button>
        {:else}<button class="pa-btn pa-btn--sm" onclick={() => noVoy(true)}><Icono n="x" tam={14} />No voy esta vez</button>{/if}
      {/if}
    </div>
    <p class="pa-faint nota">
      {#if escribible}Solo {evento.serie ? esteDia : "este evento"}; la serie, nunca sin que lo digas. Antes de escribir en Google verás el cambio y la cuenta.
      {:else if propio}Para moverlo o saltarlo en Google, activa «Crear eventos» en <a class="enlace" href="#/ajustes/cuentas">Ajustes › Cuentas</a>. «No voy esta vez» solo lo quita de tu agenda en Pauta.
      {:else}Este calendario no es tuyo{evento.calendario ? ` («${evento.calendario}»)` : ""}: Pauta no puede cambiarlo en Google. «No voy esta vez» solo lo quita de tu agenda en Pauta.{/if}
    </p>
  {:else if modo === "mover"}
    <div class="pa-label">mover solo {evento.serie ? esteDia : "este evento"} a</div>
    <div class="opciones">
      {#each huecos as h (h.dia + h.inicio)}
        <button class="pa-chip" aria-pressed={!otra && destino?.dia === h.dia && destino?.inicio === h.inicio ? "true" : "false"} onclick={() => { otra = false; destino = h; }}>{corta(h.dia)} · {rango(h.inicio, h.fin)}</button>
      {/each}
      <button class="pa-chip" aria-pressed={otra ? "true" : "false"} onclick={() => { otra = true; usarOtra(); }}>Otra hora…</button>
    </div>
    {#if !huecos.length}<p class="pa-faint nota">No hay huecos libres de {duracion(evento.fin - evento.inicio)} cerca; elige otra hora.</p>
    {:else}<p class="pa-faint nota">Huecos libres de la misma duración, mirando todas tus cuentas.</p>{/if}
    {#if otra}
      <div class="otra">
        <label>Día<input class="pa-field" type="date" bind:value={otraDia} oninput={usarOtra} /></label>
        <label>Hora<input class="pa-field" type="time" step="900" bind:value={otraHora} oninput={usarOtra} /></label>
      </div>
    {/if}
    {#if destino}
      <div class="pa-capture__preview confirmar">
        <Icono n="calendar-days" />
        <span>Se cambiará solo el <b>{corta(evento.dia)}</b> en <b>{c?.nombre}</b> (calendario {calendarioNombre}): {rango(evento.inicio, evento.fin)} → <b>{corta(destino.dia)}, {rango(destino.inicio, destino.fin)}</b>.{#if evento.serie}{" "}El resto de la serie sigue igual.{/if}{" "}Sin avisos a nadie.
          {#if choques.length}<small class="choque">Se pisa con {choques.map((x) => `«${x.titulo}» (${rango(x.inicio, x.fin)})`).join(", ")}.</small>{/if}
        </span>
      </div>
    {/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <div class="pa-insp__actions">
      <button class="pa-btn pa-btn--sm pa-btn--plain" onclick={cancelar}>Cancelar</button>
      <button class="pa-btn pa-btn--sm pa-btn--primary" disabled={!destino || trabajando} onclick={confirmar}>{trabajando ? "Moviendo…" : `Mover en ${c?.nombre}`}</button>
    </div>
  {:else}
    <div class="pa-capture__preview confirmar">
      <Icono n="x" />
      <span>Se quitará solo el <b>{corta(evento.dia)}, {rango(evento.inicio, evento.fin)}</b> de «{evento.titulo}» en <b>{c?.nombre}</b> (calendario {calendarioNombre}). El resto de la serie sigue igual. Sin avisos a nadie.</span>
    </div>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <div class="pa-insp__actions">
      <button class="pa-btn pa-btn--sm pa-btn--plain" onclick={cancelar}>Cancelar</button>
      <button class="pa-btn pa-btn--sm pa-btn--primary" disabled={trabajando} onclick={confirmar}>{trabajando ? "Saltando…" : `Saltar en ${c?.nombre}`}</button>
    </div>
  {/if}
{/if}

<style>
  .nota { margin-top: 10px; font-size: 12.5px; }
  .enlace { color: var(--accent); text-underline-offset: 2px; }
  a.pa-btn { text-decoration: none; }
  .opciones { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .otra { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
  .otra label { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: var(--text-2); flex: 1; min-width: 120px; }
  .confirmar { margin-top: 12px; }
  .confirmar small { display: block; margin-top: 4px; }
  .choque { color: var(--attention); }
  .error { color: var(--danger); font-size: 13px; margin: 10px 0 0; }
  .nota-novoy { display: flex; gap: 10px; margin: 10px 0 0; padding: 0; list-style: none; }
  .nota-novoy small { display: block; color: var(--text-2); }
  .hecho { display: flex; gap: 12px; align-items: flex-start; margin: 14px 0 4px; }
  .hecho p { margin: 4px 0 0; color: var(--text-2); font-size: 13px; }
  .hecho b { font-weight: 600; }
  .hecho .dif { color: var(--attention); }
  .hecho__icono { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex: none; border-radius: 50%; background: var(--accent-soft); color: var(--accent); }
  .hecho__icono.aviso { color: var(--attention); }
</style>
