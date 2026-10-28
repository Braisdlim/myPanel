<script>
  // Asistente con RAG (D-061 a D-063, calco de Shortwave, D-046): pregunta sobre tu agenda, tareas, notas y lo que sé de ti.
  // Cada dato de la respuesta lleva su cita [n]; debajo, de dónde sale y cómo se ha buscado.
  import { tick } from "svelte";
  import { app, ir, guardarDato } from "../lib/estado.svelte.js";
  import { asis, preguntar, permitirEnvio, parar, limpiarConversacion, usaDemo, fragmentosActuales } from "../lib/rag/asistente.svelte.js";
  import { proveedor } from "../lib/rag/proveedores.js";
  import { trocearCitas } from "../lib/rag/respuesta.js";
  import { PERSONA } from "../lib/rag/demo.js";
  import Dos from "../componentes/Dos.svelte";
  import Icono from "../componentes/Icono.svelte";

  const SUGERENCIAS_DEMO = ["¿Qué tengo mañana?", "¿Cuándo tengo el dentista?", "¿Qué le regalo a Ana?", "¿Cuántas veces tengo yoga esta semana?", "¿Qué medicamento no puedo tomar?", "¿Cuál es mi grupo sanguíneo?"];
  const SUGERENCIAS = ["¿Qué tengo mañana?", "¿Qué tengo esta semana?", "¿Qué tareas tengo pendientes?", "¿Cuándo es mi próximo evento?"];
  const ICONO = { evento: "calendar", tarea: "circle-check", memoria: "user", nota: "file-text" };
  const NOMBRE = { evento: "Evento", tarea: "Tarea", memoria: "Lo que sé de ti", nota: "Nota" };

  let texto = $state("");
  let campo;
  let lista;
  let abiertas = $state({}); // id del mensaje → «cómo lo he buscado» abierto
  let fuenteAbierta = $state(null); // `${mensaje}:${n}`
  const demo = $derived(usaDemo());
  const conf = $derived(app.ajustes.asistente);
  const prov = $derived(proveedor(conf.proveedor));
  const total = $derived(fragmentosActuales().length);

  async function enviar(e) {
    e?.preventDefault();
    const t = texto;
    texto = "";
    const p = preguntar(t);
    await tick();
    lista?.lastElementChild?.scrollIntoView({ block: "end", behavior: "smooth" });
    await p;
    await tick();
    lista?.lastElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  const teclas = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } };
  const verCita = (m, n) => { fuenteAbierta = `${m.id}:${n}`; document.getElementById(`fuente-${m.id}-${n}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); };
  function abrirFuente(f, esDemo) {
    if (esDemo) return;
    if (f.tipo === "evento") ir("calendario", "dia", f.fecha);
    else if (f.tipo === "tarea") ir("tareas", "entrada");
    else ir("ajustes", "asistente");
  }
  let nuevoDato = $state("");
  async function anotar(e) { e.preventDefault(); if (await guardarDato(nuevoDato)) nuevoDato = ""; }
</script>

{#snippet respuesta(m)}
  <p class="respuesta">
    {#each trocearCitas(m.texto) as p}
      {#if p.cita}<button class="cita" aria-label="Fuente {p.cita}" onclick={() => verCita(m, p.cita)}>{p.cita}</button>{:else}{p.texto}{/if}
    {/each}
  </p>
{/snippet}

{#snippet principal()}
  <div class="cabecera">
    <div>
      <h1><Icono n="sparkles" tam={22} estilo="color: var(--accent); vertical-align: -2px; margin-right: 8px;" />Asistente</h1>
      <p>Pregunta sobre tu agenda, tus tareas, tus notas y lo que sé de ti. Cada dato lleva su fuente.</p>
    </div>
    {#if asis.mensajes.length}<button class="pa-btn pa-btn--plain pa-btn--sm" onclick={limpiarConversacion}>Nueva conversación</button>{/if}
  </div>

  {#if demo}
    <div class="pa-alert aviso" role="note">
      <span class="pa-dot pa-dot--attention"></span>
      <span class="pa-alert__title">Datos de ejemplo: {PERSONA.nombre}</span>
      <span class="pa-alert__text">Para que puedas probarlo sin conectar nada. Todo lo que sabe de ella es inventado.</span>
      <span class="pa-alert__actions"><button class="pa-btn pa-btn--sm" onclick={() => ir("ajustes", "asistente")}>Usar mis datos</button></span>
    </div>
  {/if}

  <div class="conversacion" bind:this={lista} aria-live="polite">
    {#if !asis.mensajes.length}
      <div class="vacio-asistente">
        <p class="pa-muted">Prueba con:</p>
        <div class="sugerencias">
          {#each demo ? SUGERENCIAS_DEMO : SUGERENCIAS as s}<button class="pa-chip" onclick={() => { texto = s; enviar(); }}>{s}</button>{/each}
        </div>
      </div>
    {/if}
    {#each asis.mensajes as m (m.id)}
      {#if m.de === "tu"}
        <div class="tu">{m.texto}</div>
      {:else}
        <div class="pauta">
          <div class="quien"><Icono n="sparkles" tam={14} estilo="color: var(--accent);" />Pauta
            {#if m.estado === "listo"}<span class="pa-faint">· {m.redacta === "modelo" ? `redactado con ${m.proveedor}` : "respuesta del código, sin IA"}</span>{/if}
          </div>
          {#if m.estado === "buscando" || m.estado === "redactando"}
            <p class="pa-muted pensando">{m.estado === "buscando" ? "Buscando en tus datos…" : `Redactando con ${prov.nombre}…`}
              {#if m.estado === "redactando"}<button class="pa-btn pa-btn--plain pa-btn--sm" onclick={parar}>Parar</button>{/if}</p>
          {:else}
            {@render respuesta(m)}
            {#if m.aviso}<p class="aviso-respuesta"><Icono n="info" tam={14} />{m.aviso}</p>{/if}
            {#if m.estado === "permiso"}
              <div class="permiso">
                <p>Arriba va la respuesta del código. Para que {m.proveedor} la redacte, Pauta le enviaría solo {m.enviaria === 1 ? "el fragmento encontrado" : `los ${m.enviaria} fragmentos encontrados`} (no tus cuentas ni el resto de tus datos).</p>
                <div class="acciones-permiso">
                  <button class="pa-btn pa-btn--sm pa-btn--primary" onclick={() => permitirEnvio(m)}>Enviar y no volver a preguntar</button>
                  <button class="pa-btn pa-btn--sm" onclick={() => ir("ajustes", "asistente")}>Cambiar en Ajustes</button>
                </div>
              </div>
            {/if}
            {#if m.fuentes?.length}
              <ol class="fuentes" aria-label="Fuentes">
                {#each m.fuentes as f, i}
                  {@const clave = `${m.id}:${i + 1}`}
                  <li id="fuente-{m.id}-{i + 1}" class:resaltada={fuenteAbierta === clave}>
                    <button class="fuente" aria-expanded={fuenteAbierta === clave} onclick={() => (fuenteAbierta = fuenteAbierta === clave ? null : clave)}>
                      <span class="n">{i + 1}</span>
                      <Icono n={ICONO[f.tipo]} tam={15} />
                      <span class="fuente__texto"><b>{f.titulo}</b><small>{f.cabecera}</small></span>
                      {#if f.confianza === "no-fiable" || f.confianza === "inferido"}<span class="pa-chip marca">{f.confianza === "inferido" ? "sin confirmar" : "no verificado"}</span>{/if}
                    </button>
                    {#if fuenteAbierta === clave}
                      <div class="fuente__detalle">
                        <p>{f.texto}</p>
                        {#if !m.demo && (f.tipo === "evento" || f.tipo === "tarea")}<button class="pa-btn pa-btn--sm" onclick={() => abrirFuente(f, m.demo)}>{f.tipo === "evento" ? "Ver el día" : "Abrir Tareas"}</button>{/if}
                      </div>
                    {/if}
                  </li>
                {/each}
              </ol>
            {/if}
            <button class="plegar" aria-expanded={!!abiertas[m.id]} onclick={() => (abiertas[m.id] = !abiertas[m.id])}>
              <Icono n="search" tam={14} /><span>Cómo lo he buscado</span><Icono n={abiertas[m.id] ? "chevron-up" : "chevron-down"} tam={14} />
            </button>
            {#if abiertas[m.id]}
              <ul class="explicacion">
                <li>Datos: {m.demo ? "persona de ejemplo" : "los tuyos, en este dispositivo"} · {m.total} fragmentos{m.vectores ? " con vectores" : ""}.</li>
                {#each m.explicacion ?? [] as l}<li>{l}</li>{/each}
                <li>{m.redacta === "modelo" ? `Redacción: ${m.proveedor} (${m.modelo}), con las citas comprobadas por el código.` : "Redacción: el propio código, sin IA."}</li>
              </ul>
            {/if}
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  <form class="escribir" onsubmit={enviar}>
    <div class="caja">
      <textarea bind:this={campo} bind:value={texto} rows="1" placeholder="Pregunta algo… «¿qué tengo el viernes?»" aria-label="Pregunta" onkeydown={teclas}></textarea>
      <button class="enviar" aria-label="Preguntar" disabled={!texto.trim() || asis.ocupado}><Icono n="arrow-up" tam={18} /></button>
    </div>
    <p class="pa-faint nota">Responde {prov.id === "ninguno" ? "el código, sin IA" : `${prov.nombre}`} · las conversaciones no se guardan · <a href="#/ajustes/asistente">Ajustes</a></p>
  </form>
{/snippet}

{#snippet lateral()}
  <div class="pa-label">cómo responde</div>
  <ul class="pa-insp__rows">
    <li><Icono n="search" /><span>Busca en este dispositivo<small>{total} fragmentos de {demo ? "la persona de ejemplo" : "tus eventos, tareas, notas y datos"}; por palabras{conf.vectores ? " y por significado" : ""}</small></span></li>
    <li><Icono n="calendar" /><span>Las fechas las calcula el código<small>«El viernes», «la semana que viene», «la última vez»: nada de adivinar</small></span></li>
    <li><Icono n="sparkles" /><span>{prov.nombre}<small>{prov.id === "ninguno" ? "Nada sale del dispositivo" : "Solo recibe los fragmentos encontrados y redacta citando cada uno"}</small></span></li>
    <li><Icono n="shield-check" /><span>Citas comprobadas<small>Si cita algo que no existe, se quita; si no sabe, lo dice</small></span></li>
  </ul>
  {#if !demo}
    <div class="pa-label bloque">lo que sé de ti</div>
    <form class="anotar" onsubmit={anotar}>
      <input class="pa-field" bind:value={nuevoDato} placeholder="Un dato sobre ti… «soy alérgico al polen»" aria-label="Nuevo dato sobre ti" />
      <button class="pa-btn pa-btn--sm" disabled={!nuevoDato.trim()}>Guardar</button>
    </form>
    <p class="pa-faint pequeno">{app.memoria.length} datos y {app.notas.length} notas. Solo los que escribes tú; nada se aprende a escondidas.</p>
  {/if}
  <div class="pa-insp__actions"><button class="pa-btn pa-btn--sm" onclick={() => ir("ajustes", "asistente")}>Ajustes del asistente</button></div>
{/snippet}

<Dos {principal} {lateral} enMovil="oculto" />

<style>
  .cabecera h1 { display: flex; align-items: center; }
  .aviso { box-shadow: inset 0 0 0 1px var(--line); margin-bottom: 16px; }
  .conversacion { display: flex; flex-direction: column; gap: 14px; min-height: 120px; }
  .vacio-asistente p { margin: 0 0 8px; }
  .sugerencias { display: flex; flex-wrap: wrap; gap: 8px; }
  .tu { align-self: flex-end; max-width: 80%; padding: 8px 14px; border-radius: 18px 18px 6px 18px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line); white-space: pre-wrap; }
  .pauta { display: flex; flex-direction: column; gap: 8px; }
  .quien { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-3); }
  .respuesta { margin: 0; line-height: 22px; }
  .pensando { display: flex; align-items: center; gap: 8px; margin: 0; }
  .cita { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; margin: 0 2px; box-sizing: border-box; border: 0; border-radius: 9px; background: var(--accent-soft); color: var(--text); font: 600 11px/1 var(--font-sans); vertical-align: 2px; cursor: pointer; }
  .cita:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
  .cita { position: relative; }
  .cita::after { content: ""; position: absolute; inset: -13px -10px; } /* 44 px para el dedo sin mover el texto */
  .aviso-respuesta { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 12.5px; color: var(--text-2); }
  .permiso { padding: 12px 14px; border-radius: var(--radius-md); box-shadow: inset 0 0 0 1px var(--line); }
  .permiso p { margin: 0 0 10px; font-size: 13px; color: var(--text-2); }
  .acciones-permiso { display: flex; flex-wrap: wrap; gap: 8px; }
  .fuentes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .fuentes li { border-radius: var(--radius-md); }
  .fuentes li.resaltada { background: var(--hover); }
  .fuente { all: unset; box-sizing: border-box; display: grid; grid-template-columns: 18px 16px minmax(0, 1fr) auto; gap: 10px; align-items: center; width: 100%; min-height: 40px; padding: 6px 10px; cursor: pointer; border-radius: var(--radius-md); color: var(--text-2); }
  .fuente:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
  .n { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 9px; background: var(--accent-soft); color: var(--text); font-size: 11px; font-weight: 600; }
  .fuente__texto { display: flex; flex-direction: column; min-width: 0; }
  .fuente__texto b { font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fuente__texto small { color: var(--text-3); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .marca { cursor: default; }
  .fuente__detalle { padding: 0 10px 10px 54px; font-size: 13px; color: var(--text-2); }
  .fuente__detalle p { margin: 0 0 8px; white-space: pre-wrap; }
  .plegar { all: unset; display: flex; align-items: center; gap: 8px; align-self: flex-start; min-height: 32px; color: var(--text-3); cursor: pointer; font-size: 12.5px; }
  .plegar:focus-visible { outline: 2px solid var(--focus); border-radius: 4px; }
  .explicacion { margin: 0; padding: 8px 12px 8px 28px; border-radius: var(--radius-md); box-shadow: inset 0 0 0 1px var(--line); font-size: 12.5px; color: var(--text-2); display: flex; flex-direction: column; gap: 4px; }
  .escribir { position: sticky; bottom: 0; margin-top: 20px; padding: 10px 0 4px; background: linear-gradient(transparent, var(--bg) 30%); }
  .caja { display: flex; align-items: flex-end; gap: 10px; min-height: 48px; padding: 6px 6px 6px 18px; box-sizing: border-box; border-radius: 24px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line-strong); }
  .caja:focus-within { box-shadow: inset 0 0 0 2px var(--focus); }
  textarea { flex: 1; min-height: 36px; max-height: 140px; padding: 8px 0; border: 0; background: transparent; color: var(--text); font: inherit; resize: none; outline: none; field-sizing: content; }
  textarea::placeholder { color: var(--text-3); }
  .enviar { display: grid; place-items: center; width: 36px; height: 36px; flex: none; border: 0; border-radius: 50%; background: var(--accent); color: var(--on-accent); cursor: pointer; }
  .enviar:disabled { background: var(--hover); color: var(--text-3); cursor: default; }
  .enviar:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  .nota { margin: 6px 0 0; text-align: center; font-size: 12px; }
  .nota a { color: var(--accent); }
  .bloque { margin: 22px 0 8px; }
  .anotar { display: flex; gap: 8px; }
  .anotar .pa-field { flex: 1; min-width: 0; }
  .pequeno { font-size: 12px; margin: 6px 0 0; }
  @media (max-width: 640px) {
    .plegar, .fuente { min-height: 44px; }
    .enviar { width: 44px; height: 44px; }
    .escribir { bottom: 0; }
  }
</style>
