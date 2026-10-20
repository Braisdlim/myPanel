<script>
  import { app, ir, cambiarAjuste, exportar, borrarTodo, avisar } from "../lib/estado.svelte.js";
  import { CUENTAS } from "../lib/ejemplo.js";
  import Dos from "../componentes/Dos.svelte";
  import Icono from "../componentes/Icono.svelte";

  const SECCIONES = [["general", "General", "settings"], ["cuentas", "Cuentas", "user"], ["avisos", "Avisos", "bell"], ["asistente", "Asistente", "sparkles"], ["privacidad", "Privacidad y datos", "lock"]];
  const sec = $derived(SECCIONES.some(([s]) => s === app.ruta[1]) ? app.ruta[1] : "general");

  function descargar() {
    const url = URL.createObjectURL(new Blob([exportar()], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `pauta-${app.hoy}.json` });
    a.click();
    URL.revokeObjectURL(url);
    avisar("Copia descargada");
  }
  let confirmando = $state(false);
  async function borrar() { await borrarTodo(); confirmando = false; avisar("Datos borrados de este dispositivo"); }
</script>

{#snippet principal()}
  <div class="cabecera"><div><h1>Ajustes</h1></div></div>
  <div class="pestanas" role="tablist" aria-label="Secciones">
    {#each SECCIONES as [s, n, i]}<button class="pa-chip" role="tab" aria-selected={sec === s} aria-pressed={sec === s ? "true" : "false"} onclick={() => ir("ajustes", s)}><Icono n={i} tam={14} />{n}</button>{/each}
  </div>

  {#if sec === "general"}
    <section class="bloque">
      <h2>Tema</h2>
      <div class="pa-seg" role="group" aria-label="Tema">
        {#each [["sistema", "Del sistema"], ["light", "Claro"], ["dark", "Oscuro"]] as [v, n]}<button aria-pressed={app.ajustes.tema === v ? "true" : "false"} onclick={() => cambiarAjuste("tema", v)}>{n}</button>{/each}
      </div>
    </section>
    <section class="bloque">
      <h2>Idioma</h2>
      <div class="pa-seg" role="group" aria-label="Idioma"><button aria-pressed="true">Español</button><button disabled title="Más adelante (D-037)">English</button></div>
      <p class="pa-faint">El inglés llegará más adelante.</p>
    </section>
    <section class="bloque">
      <h2>Calendario</h2>
      <ul class="pa-insp__rows filas">
        <li><Icono n="calendar" /><span>La semana empieza el lunes<small>Zona horaria: la de este dispositivo ({Intl.DateTimeFormat().resolvedOptions().timeZone})</small></span></li>
        <li><Icono n="clock" /><span>Formato de 24 horas<small>«21:30–23:30»; si una hora es ambigua, Pauta pregunta</small></span></li>
      </ul>
    </section>
  {:else if sec === "cuentas"}
    <section class="bloque">
      <h2>Cuentas conectadas <span class="etiqueta-ejemplo">ejemplo</span></h2>
      <p class="pa-muted">Todavía no hay cuentas reales: estas tres son de ejemplo. Conectar tu Google Calendar en solo lectura es el siguiente paso.</p>
      <ul class="pa-list pa-list--lines">
        {#each CUENTAS as c}
          <li class="pa-row"><span class="pa-dot pa-dot--{c.color}"></span><span class="pa-row__main"><span class="pa-row__title">{c.nombre}</span><span class="pa-row__meta">{c.proveedor} · {c.correo} · {c.escritura ? "calendario con escritura" : "solo lectura"}</span></span></li>
        {/each}
      </ul>
      <div class="acciones">
        <button class="pa-btn" disabled><Icono n="user-plus" />Conectar Google</button>
        <button class="pa-btn" disabled><Icono n="user-plus" />Conectar Microsoft</button>
      </div>
      <p class="pa-faint">Al conectar se pedirá solo lectura. Escribir en un calendario se activa por cuenta y cada cambio se confirma diciendo la cuenta de destino.</p>
    </section>
  {:else if sec === "avisos"}
    <section class="bloque">
      <h2>Avisos</h2>
      <ul class="pa-insp__rows filas">
        <li><Icono n="triangle-alert" /><span>Planes que se solapan entre cuentas<small>En «Pide atención», con un día de margen</small></span></li>
        <li><Icono n="flag" /><span>Fechas límite<small>3 días antes, en «Pide atención»</small></span></li>
        <li><Icono n="bell" /><span>Notificaciones del sistema<small>Llegarán con la app instalada (Tauri); en el navegador aún no</small></span></li>
      </ul>
    </section>
  {:else if sec === "asistente"}
    <section class="bloque">
      <h2>Asistente <span class="etiqueta-ejemplo">maqueta</span></h2>
      <p class="pa-muted">El asistente está aplazado a una versión posterior. Estas opciones se ven como serán, pero no hacen nada.</p>
      {#each [["Dónde piensa", "Cloudflare Workers AI (gratis) · OVH de respaldo"], ["Qué puede leer", "Correo y archivos de cada cuenta, en solo lectura"], ["Qué puede hacer", "Solo proponer eventos y tareas; tú confirmas"], ["Botón de micrófono propio", "Apagado: usa el micrófono del teclado"], ["Guardar conversaciones", "Apagado"]] as [t, m]}
        <div class="pa-toggle"><span class="pa-toggle__text"><span class="pa-toggle__title">{t}</span><span class="pa-toggle__meta">{m}</span></span><button class="pa-switch" role="switch" aria-checked="false" aria-label={t} disabled></button></div>
      {/each}
    </section>
  {:else}
    <section class="bloque">
      <h2>Dónde están tus datos</h2>
      <ul class="pa-insp__rows filas">
        <li><Icono n="hard-drive" /><span>En este dispositivo<small>{app.persistente ? "Tareas, proyectos y ajustes se guardan en este navegador; no salen de aquí" : "Este navegador no deja guardar: se perderán al cerrar"}</small></span></li>
        <li><Icono n="cloud" /><span>Sin sincronizar<small>Llegará más adelante, cifrado en tu dispositivo (D-041)</small></span></li>
        <li><Icono n="info" /><span>{app.tareas.length} tareas y {app.proyectos.length} proyectos guardados</span></li>
      </ul>
      <div class="acciones">
        <button class="pa-btn" onclick={descargar}><Icono n="download" />Descargar una copia (JSON)</button>
        {#if confirmando}
          <p class="aviso-borrar">Se borrarán {app.tareas.length} tareas, {app.proyectos.length} proyectos y tus ajustes de este dispositivo. No se puede deshacer.</p>
          <button class="pa-btn pa-btn--danger" onclick={borrar}><Icono n="trash-2" />Sí, borrar todo</button>
          <button class="pa-btn pa-btn--plain" onclick={() => (confirmando = false)}>Cancelar</button>
        {:else}
          <button class="pa-btn pa-btn--danger" onclick={() => (confirmando = true)}><Icono n="trash-2" />Borrar todo de este dispositivo</button>
        {/if}
      </div>
    </section>
    <section class="bloque">
      <h2>Acerca de</h2>
      <p class="pa-muted">Pauta 0.1.0 · primera versión, paso 1. Calendarios, finanzas y asistente son de ejemplo.</p>
    </section>
  {/if}
{/snippet}

<Dos {principal} />

<style>
  .pestanas { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .bloque { margin-bottom: 26px; max-width: 640px; }
  h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font-size: 16px; line-height: 22px; font-weight: 600; }
  .filas { margin-top: 0; }
  .acciones { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 8px; }
  p { margin: 8px 0 0; }
  .aviso-borrar { flex-basis: 100%; margin: 0; color: var(--text); }
</style>
