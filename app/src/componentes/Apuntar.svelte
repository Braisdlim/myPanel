<script>
  import { app, nuevaTarea, ir, crearEventoEn, avisar } from "../lib/estado.svelte.js";
  import { calendariosPropios } from "../lib/google.js";
  import { analizar, resolver } from "../lib/analizador.js";
  import { corta, rango, hora, duracion, distancia } from "../lib/fechas.js";
  import Icono from "./Icono.svelte";
  import Hoja from "./Hoja.svelte";

  let { mod = "⌘" } = $props();
  let texto = $state(app.apuntar.texto ?? "");
  let elecciones = $state([]); // opciones elegidas para las dudas, en orden
  let campo, botonCrear;

  const base = $derived(analizar(texto, app.hoy));
  const r = $derived(elecciones.reduce((acc, op) => resolver(acc, acc.dudas.findIndex((d) => d.tipo === op.tipo), op), base));
  const pregunta = $derived(/[¿?]|^(busca|buscame|búscame|dónde|donde|qué|que tengo|cuándo|cuando)\b/i.test(texto.trim()));

  // ¿Dónde se guarda algo con día y hora? En una tarea o como evento en una cuenta con escritura (D-050).
  // Por defecto «Preguntar cada vez» (D-034): no se elige ninguna cuenta por ti.
  const conEscritura = $derived(app.cuentas.filter((c) => c.escritura));
  const puedeSerEvento = $derived(!pregunta && !!r.titulo && r.tipo === "evento" && !!r.fecha && !r.dudas.length && (r.todoElDia || r.inicio !== null));
  const inicial = () => (app.ajustes.guardarEn === "tarea" || app.cuentas.some((c) => c.escritura && c.id === app.ajustes.guardarEn) ? app.ajustes.guardarEn : null);
  let destino = $state(inicial()); // "tarea" | id de cuenta | null (sin elegir)
  const cuentaDestino = $derived(puedeSerEvento && conEscritura.length ? conEscritura.find((c) => c.id === destino) ?? null : null);
  const propios = $derived(cuentaDestino ? calendariosPropios(cuentaDestino) : []);
  let calendarioId = $state(null);
  $effect(() => { calendarioId = cuentaDestino ? (propios.some((x) => x.id === cuentaDestino.calendarioEscritura) ? cuentaDestino.calendarioEscritura : propios[0]?.id ?? null) : null; });
  const calendarioDestino = $derived(propios.find((x) => x.id === calendarioId));
  const hayQueElegir = $derived(puedeSerEvento && conEscritura.length > 0 && destino === null);

  const puedeGuardar = $derived(!!r.titulo && r.dudas.length === 0 && !pregunta && !hayQueElegir);

  let creando = $state(false);
  let errorCrear = $state("");
  let creado = $state(null); // { titulo, cuando, cuenta, calendario, enlace, diferencias }

  $effect(() => { texto; elecciones = []; errorCrear = ""; });
  $effect(() => { campo?.focus(); });
  // «Atrás» o ir a otra pantalla cierra la captura (en Android ya la cierra CloseWatcher; esto cubre el resto).
  // Se compara con la dirección al abrir para no cerrarla si se abrió justo después de cambiar de pantalla.
  const rutaAlAbrir = location.hash;
  $effect(() => { app.navegacion.n; if (location.hash !== rutaAlAbrir) cerrar(); });

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
    if (!puedeGuardar || creando) return;
    if (cuentaDestino) return crear();
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

  // Escribir en Google solo con el clic en «Crear en …» (el botón nombra la cuenta). Enter en el campo lleva al botón.
  async function crear() {
    if (!cuentaDestino || !calendarioDestino || creando) return;
    creando = true; errorCrear = "";
    const datos = { titulo: r.titulo, dia: r.fecha, inicio: r.inicio, fin: r.fin, todoElDia: r.todoElDia };
    try {
      const { enlace, diferencias } = await crearEventoEn(cuentaDestino, calendarioDestino.id, datos);
      creado = { titulo: r.titulo, cuando: `${corta(r.fecha)}${r.todoElDia ? " · todo el día" : `, ${rango(r.inicio, r.fin)}`}`, cuenta: cuentaDestino.nombre, calendario: calendarioDestino.principal ? "principal" : calendarioDestino.nombre, enlace, diferencias };
      avisar(diferencias.length ? `Creado con diferencias: ${r.titulo}` : `Creado en ${cuentaDestino.nombre}: ${r.titulo}`);
    } catch (err) { errorCrear = err.message; }
    creando = false;
  }
  function teclaCampo(e) {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (cuentaDestino && puedeGuardar) botonCrear?.focus(); // segundo Enter, sobre el botón, confirma
    else guardar(e);
  }
  function otro() { creado = null; texto = ""; campo?.focus(); }
</script>

<Hoja etiqueta="Apuntar" alCerrar={cerrar}>
  <form class="pa-capture apuntar" onsubmit={guardar}>
    {#if app.movil}<div class="pa-sheet__grabber"></div>{/if}
    {#if creado}
      <div class="hecho" role="status">
        <span class="hecho__icono" class:aviso={creado.diferencias.length}><Icono n={creado.diferencias.length ? "triangle-alert" : "check"} /></span>
        <div>
          <b>{creado.diferencias.length ? "Creado, pero Google lo guardó distinto" : "Creado y comprobado en Google"}</b>
          <p>«{creado.titulo}» · {creado.cuando}<br />{creado.cuenta} · calendario {creado.calendario}</p>
          {#each creado.diferencias as d}<p class="dif">{d}</p>{/each}
          {#if !creado.diferencias.length}<p class="pa-faint">Pauta lo ha vuelto a leer en Google y coincide con lo que pediste.</p>{/if}
        </div>
      </div>
      <div class="pa-capture__foot">
        {#if creado.enlace}<a class="pa-btn pa-btn--plain" href={creado.enlace} target="_blank" rel="noopener noreferrer"><Icono n="external-link" tam={14} />Abrir en Google Calendar</a>{/if}
        <button type="button" class="pa-btn" onclick={otro}>Apuntar otro</button>
        <button type="button" class="pa-btn pa-btn--primary" onclick={cerrar}>Listo</button>
      </div>
    {:else}
    <label class="oculto-accesible" for="apuntar-campo">Apunta una tarea o pregunta</label>
    <div class="entrada">
      <div class="espejo" aria-hidden="true">{#each trozos as [t, m]}{#if m}<span class="pa-hl">{t}</span>{:else}{t}{/if}{/each}&#8203;</div>
      <textarea id="apuntar-campo" bind:this={campo} bind:value={texto} rows="1" placeholder="Dentista el martes a las 10:30…"
        onkeydown={teclaCampo} data-foco></textarea>
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
      {#if puedeSerEvento && conEscritura.length}
        <div class="destino" role="group" aria-label="Dónde guardarlo">
          <span class="pa-faint">{destino === null ? "¿Dónde lo guardo?" : "Guardar en"}</span>
          <button type="button" class="pa-chip" aria-pressed={destino === "tarea" ? "true" : "false"} onclick={() => (destino = "tarea")}><Icono n="circle-check" tam={14} />Tarea en Pauta</button>
          {#each conEscritura as c (c.id)}
            <button type="button" class="pa-chip" aria-pressed={destino === c.id ? "true" : "false"} onclick={() => (destino = c.id)}><span class="pa-dot pa-dot--{c.color}"></span>Evento en {c.nombre}</button>
          {/each}
        </div>
      {/if}
      {#if r.titulo && !r.dudas.length}
        {#if cuentaDestino}
          <div class="pa-capture__preview confirmar">
            <Icono n="calendar-plus" />
            <span>
              Se creará un <b>evento</b> «{r.titulo}» el <b>{corta(r.fecha)}</b>{#if r.todoElDia}, <b>todo el día</b>{:else}, de <b>{rango(r.inicio, r.fin)}</b>{/if},
              en <b>{cuentaDestino.nombre}</b> (Google){#if propios.length <= 1}, calendario {calendarioDestino?.principal ? "principal" : `«${calendarioDestino?.nombre}»`}{/if}.
              {#if propios.length > 1}
                <label class="cal">Calendario
                  <select class="pa-field" bind:value={calendarioId}>{#each propios as p (p.id)}<option value={p.id}>{p.principal ? `${p.nombre} (principal)` : p.nombre}</option>{/each}</select>
                </label>
              {/if}
              <small class="pa-faint">Sin invitados ni avisos a nadie. Después, Pauta lo relee en Google para comprobarlo.</small>
            </span>
          </div>
        {:else if !hayQueElegir}
          <div class="pa-capture__preview">
            <Icono n={r.tipo === "evento" ? "calendar-plus" : "circle-check"} />
            <span>
              Se guardará una <b>tarea</b> «{r.titulo}»{#if r.fecha} para el <b>{corta(r.fecha)}</b>{/if}{#if r.inicio !== null && !r.todoElDia} a las <b>{hora(r.inicio)}</b>{/if}, en este dispositivo.
              {#if r.tipo === "evento" && !conEscritura.length}
                <br />{#if app.cuentas.length}Para crearlo en tu calendario, activa «Crear eventos» en <a class="enlace" href="#/ajustes/cuentas" onclick={cerrar}>Ajustes › Cuentas</a>.{:else}Para crearlo en tu calendario, conecta tu cuenta de Google en <a class="enlace" href="#/ajustes/cuentas" onclick={cerrar}>Ajustes › Cuentas</a>.{/if}
              {:else if r.tipo === "evento" && !r.fecha}<br />Para crearlo como evento, di también el día.{/if}
            </span>
          </div>
        {/if}
      {/if}
      {#if errorCrear}<p class="error" role="alert">{errorCrear}</p>{/if}
    {/if}

    {#if pregunta}
      <div class="pa-capture__preview">
        <Icono n="sparkles" />
        <span>Parece una pregunta. El <b>asistente</b> aún no está conectado (llegará en una versión posterior).</span>
      </div>
    {/if}

    <div class="pa-capture__foot">
      {#if !app.movil}<span><span class="pa-kbd">↩</span> {cuentaDestino ? "ir a «Crear»; otra vez, confirmar" : "guardar"} · <span class="pa-kbd">esc</span> cerrar</span>{/if}
      {#if pregunta}
        <button type="button" class="pa-btn" onclick={preguntar}>Ver el asistente</button>
      {:else}
        <button type="button" class="pa-btn pa-btn--plain" onclick={cerrar}>Cancelar</button>
        {#if cuentaDestino}
          <button type="submit" class="pa-btn pa-btn--primary" bind:this={botonCrear} disabled={!puedeGuardar || creando}><Icono n="calendar-plus" tam={16} />{creando ? "Creando…" : `Crear en ${cuentaDestino.nombre}`}</button>
        {:else}
          <button type="submit" class="pa-btn pa-btn--primary" disabled={!puedeGuardar}>{hayQueElegir ? "Elige dónde" : "Guardar tarea"}</button>
        {/if}
      {/if}
    </div>
    {/if}
  </form>
</Hoja>

<style>
  .apuntar { box-shadow: var(--shadow-menu); }
  .entrada { position: relative; }
  .espejo, textarea { font: 400 17px/24px var(--font-sans); padding: 0; margin: 0; white-space: pre-wrap; word-break: break-word; }
  .espejo { color: transparent; }
  .espejo :global(.pa-hl) { color: transparent; padding: 0; border-radius: 2px; }
  textarea { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; outline: none; resize: none; background: transparent; color: var(--text); overflow: hidden; }
  textarea::placeholder { color: var(--text-3); }
  .destino { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; }
  .destino .pa-dot { width: 8px; height: 8px; }
  .confirmar small { display: block; margin-top: 4px; }
  .cal { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .cal .pa-field { flex: 1; min-width: 0; }
  .error { color: var(--danger); font-size: 13px; margin: 10px 0 0; }
  .enlace { color: var(--accent); text-underline-offset: 2px; }
  .hecho { display: flex; gap: 12px; align-items: flex-start; padding: 4px 0 8px; }
  .hecho p { margin: 4px 0 0; color: var(--text-2); }
  .hecho b { font-weight: 600; }
  .hecho .dif { color: var(--attention); }
  .hecho__icono { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex: none; border-radius: 50%; background: var(--accent-soft); color: var(--accent); }
  .hecho__icono.aviso { color: var(--attention); }
  a.pa-btn { text-decoration: none; }
  @media (max-width: 640px) {
    .apuntar { border-radius: var(--radius-xl) var(--radius-xl) 0 0; padding: 8px 16px calc(16px + env(safe-area-inset-bottom, 0px)); min-height: 50dvh; }
    .espejo, textarea { font-size: 18px; line-height: 26px; }
    .entrada { min-height: 48px; } /* objetivo táctil */
    .espejo { padding: 11px 0; }
    textarea { padding: 11px 0; }
    .pa-capture__foot { justify-content: stretch; flex-wrap: wrap; }
    .pa-capture__foot a.pa-btn { flex-basis: 100%; }
    .destino { gap: 6px; }
    .pa-capture__foot :global(.pa-btn) { flex: 1; }
  }
</style>
