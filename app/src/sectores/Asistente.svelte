<script>
  // Maqueta del asistente (D-047): se ve como será, pero no está conectado a ningún modelo ni cuenta.
  import { app, ir } from "../lib/estado.svelte.js";
  import Dos from "../componentes/Dos.svelte";
  import Icono from "../componentes/Icono.svelte";

  const CONSULTAS = [
    ["Gmail 1", "c1", "gestoría factura has:attachment after:2026/9/1", 2],
    ["Gmail 2", "c2", "gestoría factura has:attachment after:2026/9/1", 0],
    ["Outlook", "c3", '$search="gestoría factura" · desde 1 sep', 0],
  ];
  const CORREOS = [
    [1, "Gestoría [nombre]", "6 oct", "Factura de septiembre", "Te adjuntamos la factura de septiembre por [importe]…", "Factura_2026-09.pdf"],
    [2, "Gestoría [nombre]", "8 oct", "Re: factura de septiembre", "Una aclaración: a partir de octubre el cargo llegará desde otra cuenta…", ""],
  ];
  let abierta = $state(true);
</script>

{#snippet principal()}
  <div class="cabecera">
    <div><h1><Icono n="sparkles" tam={22} estilo="color: var(--accent); vertical-align: -2px; margin-right: 8px;" />Asistente</h1><p>Busca en tus correos y archivos y prepara eventos. Nada se escribe sin tu confirmación.</p></div>
  </div>

  <div class="pa-alert aviso" role="note">
    <span class="pa-dot pa-dot--attention"></span>
    <span class="pa-alert__title">Aún no funciona: esto es una maqueta</span>
    <span class="pa-alert__text">El asistente llegará en una versión posterior. Lo de abajo es un ejemplo de cómo responderá; no lee tus cuentas ni usa ningún modelo de IA.</span>
  </div>

  <div class="conversacion" aria-label="Conversación de ejemplo">
    <div class="tu">Búscame el correo de la gestoría con la factura de septiembre</div>
    <div class="quien"><Icono n="sparkles" tam={14} estilo="color: var(--accent);" />Pauta <span class="etiqueta-ejemplo">ejemplo</span></div>
    <div class="consulta">
      <button class="plegar" aria-expanded={abierta} onclick={() => (abierta = !abierta)}><Icono n="search" tam={14} /><span>Busqué en 3 cuentas · 2 correos</span><Icono n={abierta ? "chevron-up" : "chevron-down"} tam={14} /></button>
      {#if abierta}
        <ul>
          {#each CONSULTAS as [c, k, q, n]}<li><span class="cuenta"><span class="pa-dot pa-dot--{k}"></span>{c}</span><code>{q}</code><span class="pa-num" class:cero={!n}>{n}</span></li>{/each}
        </ul>
      {/if}
    </div>
    <p class="respuesta">Está en <b>Gmail 1</b>: la gestoría te la mandó el 6 de octubre con el PDF adjunto <sup>1</sup>. Dos días después escribieron otra vez por un cambio en la cuenta del cargo <sup>2</sup>.</p>
    <ul class="pa-list correos">
      {#each CORREOS as [n, de, f, asunto, frag, adj]}
        <li class="correo">
          <span class="n">{n}</span>
          <span class="cuerpo">
            <span class="linea"><span class="pa-dot pa-dot--c1"></span><b>{de}</b><span class="pa-faint pa-num">{f}</span></span>
            <span class="asunto">{asunto}</span>
            <span class="pa-muted frag">{frag}</span>
            <span class="pa-faint">Gmail 1</span>
            {#if adj}<span class="pa-chip adjunto"><Icono n="paperclip" tam={12} />{adj}</span>{/if}
          </span>
        </li>
      {/each}
    </ul>
    <p class="pie-ejemplo">Contenido de ejemplo. Lo que va entre corchetes se rellenará con tus datos.</p>
  </div>

  <div class="escribir">
    <div class="caja" aria-disabled="true"><span class="pa-faint">Pregunta o apunta… (aún no disponible)</span><Icono n="mic" tam={18} /><span class="enviar"><Icono n="arrow-up" tam={16} /></span></div>
    <p class="pa-faint nota">Mientras tanto, para apuntar tareas usa <button class="pa-btn pa-btn--plain pa-btn--sm" onclick={() => (app.apuntar = { abierto: true, texto: "", contexto: null })}>Apuntar</button></p>
  </div>
{/snippet}

{#snippet lateral()}
  <div class="pa-label">cómo funcionará</div>
  <ul class="pa-insp__rows">
    <li><Icono n="search" /><span>Busca en tus 3 cuentas a la vez<small>Correos, Drive y OneDrive, enseñando la búsqueda que lanza</small></span></li>
    <li><Icono n="calendar-plus" /><span>Prepara eventos<small>Como propuesta: tú eliges si hay dudas y confirmas la cuenta</small></span></li>
    <li><Icono n="shield-check" /><span>Solo lectura<small>No envía correos ni borra nada</small></span></li>
    <li><Icono n="lock" /><span>Tus cuentas no salen de tu dispositivo<small>El modelo solo verá tu frase, no el contenido de tus correos</small></span></li>
  </ul>
  <div class="pa-insp__actions"><button class="pa-btn pa-btn--sm" onclick={() => ir("ajustes", "asistente")}>Ajustes del asistente</button></div>
{/snippet}

<Dos {principal} {lateral} />

<style>
  .cabecera h1 { display: flex; align-items: center; }
  .aviso { box-shadow: inset 0 0 0 1px var(--line); margin-bottom: 20px; }
  .conversacion { display: flex; flex-direction: column; gap: 12px; }
  .tu { align-self: flex-end; max-width: 80%; padding: 8px 14px; border-radius: 18px 18px 6px 18px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line); }
  .quien { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-3); }
  .consulta { padding: 8px 12px; border-radius: var(--radius-md); box-shadow: inset 0 0 0 1px var(--line); }
  .plegar { all: unset; display: flex; align-items: center; gap: 8px; width: 100%; min-height: 32px; color: var(--text-2); cursor: pointer; font-size: 13px; }
  @media (max-width: 640px) { .plegar { min-height: 44px; } }
  .plegar span { flex: 1; }
  .consulta ul { list-style: none; margin: 6px 0 0; padding: 0; font-size: 12.5px; }
  .consulta li { display: grid; grid-template-columns: 84px minmax(0, 1fr) auto; gap: 10px; padding: 5px 0; border-top: 1px solid var(--line); align-items: baseline; }
  .cuenta { display: flex; align-items: center; gap: 6px; color: var(--text-2); }
  code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px; color: var(--text-2); overflow-wrap: anywhere; }
  .cero { color: var(--text-3); }
  .respuesta { margin: 0; line-height: 21px; }
  .respuesta b { font-weight: 500; }
  sup { display: inline-grid; place-items: center; min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box; border-radius: 8px; background: var(--accent-soft); font-size: 10.5px; font-weight: 600; vertical-align: 2px; }
  .correo { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 10px; padding: 10px 12px; border-radius: var(--radius-md); }
  .correo:first-child { background: var(--accent-soft); }
  .n { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 9px; background: var(--accent-soft); font-size: 11px; font-weight: 600; }
  .cuerpo { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .linea { display: flex; align-items: center; gap: 8px; }
  .linea b { flex: 1; font-weight: 500; }
  .frag { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adjunto { align-self: flex-start; margin-top: 4px; cursor: default; }
  .escribir { margin-top: 24px; }
  .caja { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 6px 0 18px; border-radius: 24px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line-strong); color: var(--text-3); opacity: 0.7; }
  .caja > span:first-child { flex: 1; }
  .enviar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; box-shadow: inset 0 0 0 1px var(--line-strong); }
  .nota { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 8px 0 0; font-size: 12.5px; }
</style>
