<script>
  import { app, ir, cambiarAjuste, exportar, borrarTodo, avisar, conectarGoogle, actualizarCuenta, cambiarCalendario, renombrarCuenta, desconectarCuenta, tienePermiso, activarEscritura, desactivarEscritura, elegirCalendarioEscritura } from "../lib/estado.svelte.js";
  import { CUENTAS } from "../lib/ejemplo.js";
  import { CLIENT_ID, calendariosPropios } from "../lib/google.js";
  import { haceCuanto } from "../lib/fechas.js";
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
  // ---------- cuentas ----------
  let conectando = $state(false);
  let error = $state(""); // del último «Conectar Google»
  let errores = $state({}); // id de cuenta → mensaje
  let quitando = $state(null); // id de la cuenta que se va a desconectar
  let renombrando = $state(null);
  let nombreNuevo = $state("");

  async function conectar() {
    conectando = true; error = "";
    try { const c = await conectarGoogle(); avisar(`Conectada: ${c.correo}`); }
    catch (e) { error = e.message; }
    conectando = false;
  }
  async function intentar(c, f) {
    errores[c.id] = "";
    try { await f(); } catch (e) { errores[c.id] = e.message; }
  }
  const actualizar = (c) => intentar(c, () => actualizarCuenta(c));
  async function alternarCalendario(c, cal) {
    await cambiarCalendario(c, cal.id, !cal.activo);
    if (!cal.activo) await actualizar(c); // al encenderlo hay que traer sus eventos
  }
  let pidiendo = $state(null); // id de la cuenta que espera a Google para crear eventos
  async function alternarEscritura(c) {
    if (c.escritura) { await desactivarEscritura(c); avisar(`Ya no se crean eventos en ${c.nombre}`); return; }
    pidiendo = c.id;
    await intentar(c, async () => { await activarEscritura(c); avisar(`Crear eventos activado en ${c.nombre}`); });
    pidiendo = null;
  }
  async function guardarNombre(e, c) { e.preventDefault(); await renombrarCuenta(c, nombreNuevo); renombrando = null; }
  async function desconectar(c) { const retirado = await desconectarCuenta(c); quitando = null; avisar(retirado ? `Desconectada y sin permiso: ${c.correo}` : `Desconectada: ${c.correo}`); }
  const numEventos = (c) => new Set((app.eventos[c.id] ?? []).map((e) => e.uid + e.calendarioId)).size;
  const estado = (c) => { const s = app.sync[c.id]; app.ahora; return !s ? "Sin actualizar todavía" : s.estado === "cargando" ? "Actualizando…" : s.actualizado ? `Actualizado ${haceCuanto(s.actualizado)}` : "Sin actualizar todavía"; };

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
    <section class="bloque">
      <h2>Al apuntar algo con día y hora</h2>
      <label class="campo-ajuste">
        <span class="pa-faint">Dónde se guarda «dentista el martes a las 10:30»</span>
        <select class="pa-field" value={app.ajustes.guardarEn} onchange={(e) => cambiarAjuste("guardarEn", e.currentTarget.value)}>
          <option value="preguntar">Preguntar cada vez</option>
          <option value="tarea">Como tarea en Pauta</option>
          {#each app.cuentas.filter((c) => c.escritura) as c (c.id)}<option value={c.id}>Como evento en {c.nombre}</option>{/each}
        </select>
      </label>
      <p class="pa-faint">{app.cuentas.some((c) => c.escritura) ? "Aunque elijas una cuenta, el evento solo se crea al pulsar «Crear en …», con la cuenta a la vista." : "Para crear eventos, actívalo en una cuenta en Ajustes › Cuentas."}</p>
    </section>
  {:else if sec === "cuentas"}
    <section class="bloque">
      {#if app.cuentas.length}
        <h2>Cuentas conectadas</h2>
        <div class="cuentas">
          {#each app.cuentas as c (c.id)}
            <article class="pa-card cuenta" aria-label="Cuenta {c.correo}">
              <div class="cuenta__cab">
                <span class="pa-dot pa-dot--{c.color}"></span>
                {#if renombrando === c.id}
                  <form class="renombrar" onsubmit={(e) => guardarNombre(e, c)}>
                    <!-- svelte-ignore a11y_autofocus -->
                    <input class="pa-field" bind:value={nombreNuevo} aria-label="Nombre de la cuenta" placeholder={c.correo} autofocus onkeydown={(e) => e.key === "Escape" && (renombrando = null)} />
                    <button class="pa-btn pa-btn--sm pa-btn--primary">Guardar</button>
                  </form>
                {:else}
                  <span class="cuenta__nombre"><b>{c.nombre}</b><span class="pa-faint">{c.nombre !== c.correo ? `${c.correo} · ` : ""}Google · {c.escritura ? "crea eventos" : "solo lectura"}</span></span>
                  <button class="pa-btn pa-btn--icon" aria-label="Cambiar el nombre de {c.correo}" title="Cambiar el nombre" onclick={() => { renombrando = c.id; nombreNuevo = c.nombre === c.correo ? "" : c.nombre; }}><Icono n="pencil" /></button>
                {/if}
              </div>
              <p class="cuenta__estado" class:con-error={app.sync[c.id]?.estado === "error"}>
                {estado(c)} · {numEventos(c)} eventos guardados en este dispositivo
              </p>
              {#if errores[c.id]}<p class="cuenta__error" role="alert">{errores[c.id]}</p>{/if}

              <div class="pa-label calendarios">calendarios</div>
              {#each c.calendarios as cal (cal.id)}
                <div class="pa-toggle">
                  <span class="pa-toggle__text"><span class="pa-toggle__title">{cal.nombre}</span><span class="pa-toggle__meta">{cal.principal ? "Principal" : cal.rol === "owner" ? "Tuyo" : cal.rol === "reader" || cal.rol === "freeBusyReader" ? "Compartido contigo" : "Suscrito"}</span></span>
                  <button class="pa-switch" role="switch" aria-checked={cal.activo ? "true" : "false"} aria-label="Mostrar {cal.nombre}" onclick={() => alternarCalendario(c, cal)}></button>
                </div>
              {/each}

              <div class="pa-label calendarios">escritura</div>
              <div class="pa-toggle">
                <span class="pa-toggle__text"><span class="pa-toggle__title">Crear eventos</span><span class="pa-toggle__meta">{pidiendo === c.id ? "Esperando el permiso de Google…" : c.escritura ? "Desde Apuntar, siempre con «Crear en …» y relectura" : "Pide a Google permiso para crear eventos en tus calendarios (no en los compartidos)"}</span></span>
                <button class="pa-switch" role="switch" aria-checked={c.escritura ? "true" : "false"} aria-label="Crear eventos en {c.correo}" disabled={pidiendo === c.id} onclick={() => alternarEscritura(c)}></button>
              </div>
              {#if c.escritura && calendariosPropios(c).length > 1}
                <label class="campo-ajuste">
                  <span class="pa-faint">Calendario por defecto</span>
                  <select class="pa-field" value={c.calendarioEscritura} onchange={(e) => elegirCalendarioEscritura(c, e.currentTarget.value)}>
                    {#each calendariosPropios(c) as p (p.id)}<option value={p.id}>{p.principal ? `${p.nombre} (principal)` : p.nombre}</option>{/each}
                  </select>
                </label>
              {/if}

              <div class="acciones">
                <button class="pa-btn pa-btn--sm" onclick={() => actualizar(c)} disabled={app.sync[c.id]?.estado === "cargando"}><Icono n="refresh-cw" tam={14} />Actualizar</button>
                {#if quitando === c.id}
                  <p class="aviso-borrar">Se borrarán de este dispositivo los eventos guardados de <b>{c.correo}</b> {#if tienePermiso(c)}y Pauta retirará su permiso en Google{:else}. El permiso de Google se retira en <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">tu cuenta de Google</a> (Pauta no puede hacerlo sin pedírtelo otra vez){/if}. Tu Google Calendar no cambia.</p>
                  <button class="pa-btn pa-btn--sm pa-btn--danger" onclick={() => desconectar(c)}><Icono n="log-out" tam={14} />Sí, desconectar</button>
                  <button class="pa-btn pa-btn--sm pa-btn--plain" onclick={() => (quitando = null)}>Cancelar</button>
                {:else}
                  <button class="pa-btn pa-btn--sm pa-btn--plain" onclick={() => (quitando = c.id)}><Icono n="log-out" tam={14} />Desconectar</button>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <h2>Cuentas conectadas <span class="etiqueta-ejemplo">ejemplo</span></h2>
        <p class="pa-muted">Todavía no hay cuentas reales: estas tres son de ejemplo y desaparecen al conectar la primera.</p>
        <ul class="pa-list pa-list--lines">
          {#each CUENTAS as c}
            <li class="pa-row"><span class="pa-dot pa-dot--{c.color}"></span><span class="pa-row__main"><span class="pa-row__title">{c.nombre}</span><span class="pa-row__meta">{c.proveedor} · {c.correo} · {c.escritura ? "calendario con escritura" : "solo lectura"}</span></span></li>
          {/each}
        </ul>
      {/if}

      <div class="acciones">
        <button class="pa-btn" class:pa-btn--primary={!app.cuentas.length && CLIENT_ID} onclick={conectar} disabled={!CLIENT_ID || conectando}><Icono n="user-plus" />{conectando ? "Esperando a Google…" : app.cuentas.length ? "Conectar otra cuenta de Google" : "Conectar Google"}</button>
        <button class="pa-btn" disabled title="Más adelante"><Icono n="user-plus" />Conectar Microsoft</button>
      </div>
      {#if error}<p class="cuenta__error" role="alert">{error}</p>{/if}
      {#if !CLIENT_ID}
        <p class="pa-muted">Para conectar Google falta un paso que se hace una vez: crear tu ID de cliente en Google Cloud y ponerlo en <code>app/.env</code>. La guía está en <code>docs/guias/conectar-google-calendar.md</code>.</p>
      {/if}
      <ul class="pa-insp__rows filas">
        <li><Icono n="shield-check" /><span>Lectura, y escribir solo si lo activas<small>Al conectar, Pauta pide ver la lista de tus calendarios y sus eventos. Crear eventos se activa por cuenta y pide un permiso aparte, solo para calendarios tuyos; cada evento se confirma con la cuenta a la vista y se comprueba releyéndolo. Pauta no cambia ni borra eventos.</small></span></li>
        <li><Icono n="lock" /><span>El permiso no se guarda<small>Dura una hora y vive solo en esta pestaña. Al recargar ves lo guardado; «Actualizar» lo vuelve a pedir.</small></span></li>
        <li><Icono n="triangle-alert" /><span>Aviso de app no verificada<small>Google lo muestra porque la app es tuya y no ha pasado su revisión. Puedes retirar el permiso cuando quieras en <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">tu cuenta de Google</a>.</small></span></li>
      </ul>
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
        <li><Icono n="hard-drive" /><span>En este dispositivo<small>{app.persistente ? `Tareas, proyectos, ajustes${app.cuentas.length ? " y la copia de tus calendarios" : ""} se guardan en este navegador; no salen de aquí` : "Este navegador no deja guardar: se perderán al cerrar"}</small></span></li>
        <li><Icono n="cloud" /><span>Sin sincronizar<small>Llegará más adelante, cifrado en tu dispositivo (D-041)</small></span></li>
        <li><Icono n="info" /><span>{app.tareas.length} tareas y {app.proyectos.length} proyectos guardados{#if app.cuentas.length}<small>{app.cuentas.length === 1 ? "1 cuenta conectada" : `${app.cuentas.length} cuentas conectadas`}</small>{/if}</span></li>
      </ul>
      <div class="acciones">
        <button class="pa-btn" onclick={descargar}><Icono n="download" />Descargar una copia (JSON)</button>
        {#if confirmando}
          <p class="aviso-borrar">Se borrarán {app.tareas.length} tareas, {app.proyectos.length} proyectos{app.cuentas.length ? ", la copia de tus calendarios (y se desconectarán tus cuentas)" : ""} y tus ajustes de este dispositivo. Tus calendarios de Google no cambian. No se puede deshacer.</p>
          <button class="pa-btn pa-btn--danger" onclick={borrar}><Icono n="trash-2" />Sí, borrar todo</button>
          <button class="pa-btn pa-btn--plain" onclick={() => (confirmando = false)}>Cancelar</button>
        {:else}
          <button class="pa-btn pa-btn--danger" onclick={() => (confirmando = true)}><Icono n="trash-2" />Borrar todo de este dispositivo</button>
        {/if}
      </div>
    </section>
    <section class="bloque">
      <h2>Acerca de</h2>
      <p class="pa-muted">Pauta 0.3.0 · primera versión, paso 3 bis: tus calendarios de Google sin repetidos, crear eventos desde Apuntar y cambiar solo esta vez. Finanzas y asistente siguen siendo de ejemplo.</p>
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
  .cuentas { display: flex; flex-direction: column; gap: 12px; }
  .cuenta__cab { display: flex; align-items: center; gap: 10px; }
  .cuenta__nombre { display: flex; flex-direction: column; flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .cuenta__nombre b { font-weight: 600; }
  .cuenta__estado { color: var(--text-2); font-size: 13px; }
  .con-error { color: var(--attention); }
  .cuenta__error { color: var(--danger); font-size: 13px; }
  .calendarios { margin: 14px 0 4px; }
  .renombrar { display: flex; flex: 1; gap: 8px; }
  .renombrar .pa-field { flex: 1; min-width: 0; }
  .campo-ajuste { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .campo-ajuste .pa-field { max-width: 360px; }
  code { font-family: ui-monospace, monospace; font-size: 0.92em; }
</style>
